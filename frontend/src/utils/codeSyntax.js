/**
 * @module codeSyntax
 * Shared safe syntax tokenizer and code-editor line/indentation formatter
 * reused across QuizArenaView (Code Example) and ArrangeCodeQuestion.
 */

// ─── Safe Single-Pass Syntax Tokenizer (No v-html) ────────────────────────────
const TOKEN_REGEX =
  /(\/\/.*$|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(<\/?[a-zA-Z!][^>\n]*>)|\b(using|class|static|void|int|double|string|String|bool|boolean|true|false|null|const|var|val|fun|if|else|when|for|foreach|while|return|function|let|console|Console|println|print|readln|alert|document|window|display|flex|grid|@media)\b/g

/**
 * Tokenize one line of code into colored span descriptors.
 * @param {string} line
 * @returns {Array<{ text: string, cls: string }>}
 */
export function tokenizeCodeLine(line) {
  const str = String(line ?? '')
  const tokens = []
  let lastIndex = 0
  TOKEN_REGEX.lastIndex = 0

  let match
  while ((match = TOKEN_REGEX.exec(str)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: str.slice(lastIndex, match.index), cls: 'text-[#E2E8F0]' })
    }
    if (match[1]) {
      tokens.push({ text: match[0], cls: 'text-[#64748B] italic' })
    } else if (match[2]) {
      tokens.push({ text: match[0], cls: 'text-[#FDE047]' })
    } else if (match[3]) {
      tokens.push({ text: match[0], cls: 'text-[#FF6B8A]' })
    } else if (match[4]) {
      tokens.push({ text: match[0], cls: 'text-[#67D4FA] font-semibold' })
    }
    lastIndex = TOKEN_REGEX.lastIndex
  }

  if (lastIndex < str.length) {
    tokens.push({ text: str.slice(lastIndex), cls: 'text-[#E2E8F0]' })
  }
  return tokens
}

// ─── Editor Line & Indentation Formatter for ArrangeCodeQuestion ─────────────
const CONTAINER_HTML_TAGS = new Set([
  'html', 'head', 'body', 'header', 'nav', 'main', 'section',
  'article', 'aside', 'footer', 'ul', 'ol', 'table', 'thead',
  'tbody', 'tr', 'form', 'select', 'div', 'script', 'style',
])

const INLINE_HTML_TAGS = new Set([
  'p', 'strong', 'em', 'b', 'i', 'span', 'a', 'code', 'small',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th',
  'label', 'button', 'title', 'option',
])

const VOID_HTML_TAGS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link'])
const OPERATOR_OR_PUNCT_RE = /^(=|==|===|!=|!==|<=|>=|<|>|\+|-|\*|\/|%|\&\&|\|\||\(|\)|;|,)$/
const CONTINUATION_PREV_RE = /^(=|==|===|!=|!==|<=|>=|\+|-|\*|\/|%|\&\&|\|\||\(|,)$/

function extractHtmlTagEvents(code) {
  const events = []
  let inlineDelta = 0
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*\/?>/g
  let match

  while ((match = tagRe.exec(code)) !== null) {
    const raw = match[0]
    const tag = match[1].toLowerCase()
    if (raw.endsWith('/>') || VOID_HTML_TAGS.has(tag)) continue

    const isClosing = raw.startsWith('</')
    if (INLINE_HTML_TAGS.has(tag)) {
      inlineDelta += isClosing ? -1 : 1
    }
    if (CONTAINER_HTML_TAGS.has(tag)) {
      events.push({ tag, isClosing, atStart: match.index === 0 })
    }
  }

  return {
    hasHtml: events.length > 0 || inlineDelta !== 0 || /^<!doctype\b/i.test(code.trim()),
    events,
    inlineDelta,
  }
}

function applyHtmlTagEvent(stack, event) {
  if (!event.isClosing) {
    stack.push(event.tag)
    return
  }
  const idx = stack.lastIndexOf(event.tag)
  if (idx !== -1) {
    stack.splice(idx)
  }
}

function shouldBreakLineBefore(prevCode, currCode, { openInlineHtmlCount, assemblySeparator }) {
  if (assemblySeparator === '') return false

  const prev = prevCode.trim()
  const curr = currCode.trim()

  if (curr.startsWith('[') && /\.[a-z0-9]+\]/i.test(curr)) return true
  if (openInlineHtmlCount > 0) return false

  const prevIsHtml = /<[^>]+>/.test(prev)
  const currIsHtml = /<[^>]+>/.test(curr)
  if (prevIsHtml || currIsHtml) return true

  if (prev.endsWith(';') || prev.endsWith('{') || prev.endsWith('}')) return true
  if (curr.startsWith('{') || curr.startsWith('}')) return true
  if (/^else\b/.test(curr)) return true

  if (/^(using|class|static|fun|if|else|for|foreach|while|when)\b/.test(prev) && !CONTINUATION_PREV_RE.test(prev)) {
    return true
  }

  if (CONTINUATION_PREV_RE.test(prev) || OPERATOR_OR_PUNCT_RE.test(curr)) {
    return false
  }
  if (/^(int|double|string|bool|boolean|let|const|var|val)\s+[a-zA-Z_]\w*$/.test(prev)) {
    return false
  }

  return true
}

/**
 * Lay out user-selected arrange_code fragments into real code editor lines with
 * automatic indentation and syntax tokens, preserving each fragment's `origIndex`
 * so users can tap any placed fragment directly in the editor to remove it.
 *
 * @param {Array<{ id: string|number, code: string }>} selectedFragments
 * @param {{ assemblySeparator?: string }} [options]
 * @returns {Array<{ lineNumber: number, indentLevel: number, joinGap: string, items: Array<{ origIndex: number, id: string|number, code: string, displayText: string, tokens: Array<{ text: string, cls: string }> }> }>}
 */
export function formatArrangedCodeLines(selectedFragments, { assemblySeparator = ' ' } = {}) {
  if (!Array.isArray(selectedFragments) || selectedFragments.length === 0) return []

  const lines = []
  const htmlTagStack = []
  let braceIndent = 0
  let openInlineHtmlCount = 0
  let currentLine = null

  selectedFragments.forEach((frag, origIndex) => {
    const rawCode = String(frag.code ?? '')
    const displayText = rawCode.trimStart()
    const trimmed = displayText.trim()

    const prevFrag = origIndex > 0 ? selectedFragments[origIndex - 1] : null
    const startNewLine =
      !currentLine ||
      shouldBreakLineBefore(prevFrag.code, rawCode, {
        openInlineHtmlCount,
        assemblySeparator,
      })

    const htmlInfo = extractHtmlTagEvents(trimmed)
    const startsWithClosingBrace = trimmed.startsWith('}')
    const opensBraceOnFragment = trimmed.endsWith('{') || trimmed === '{'

    // Consume leading closing HTML tags before reading the line's indent depth
    let consumedLeadingEvents = 0
    if (startNewLine && htmlInfo.events.length > 0) {
      while (
        consumedLeadingEvents < htmlInfo.events.length &&
        htmlInfo.events[consumedLeadingEvents].isClosing
      ) {
        applyHtmlTagEvent(htmlTagStack, htmlInfo.events[consumedLeadingEvents])
        consumedLeadingEvents++
      }
    }

    if (startNewLine) {
      if (startsWithClosingBrace) {
        braceIndent = Math.max(0, braceIndent - 1)
      }
      const htmlIndent = Math.min(3, htmlTagStack.length)

      currentLine = {
        lineNumber: lines.length + 1,
        indentLevel: braceIndent + htmlIndent,
        joinGap: assemblySeparator,
        items: [],
      }
      lines.push(currentLine)
    } else if (startsWithClosingBrace && trimmed.includes('{')) {
      braceIndent = Math.max(0, braceIndent - 1)
    }

    currentLine.items.push({
      origIndex,
      id: frag.id,
      code: rawCode,
      displayText,
      tokens: tokenizeCodeLine(displayText),
    })

    if (opensBraceOnFragment) {
      braceIndent++
    }
    if (!startNewLine && startsWithClosingBrace && !trimmed.includes('{')) {
      braceIndent = Math.max(0, braceIndent - 1)
    }

    openInlineHtmlCount = Math.max(0, openInlineHtmlCount + htmlInfo.inlineDelta)
    for (let i = consumedLeadingEvents; i < htmlInfo.events.length; i++) {
      applyHtmlTagEvent(htmlTagStack, htmlInfo.events[i])
    }
  })

  return lines
}
