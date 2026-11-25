/**
 * @module levelNormalizer
 * Normalizes heterogeneous Content JSON structures (Absen Kecil `levels[]`,
 * Absen Besar `level`, `content_blueprint`, and field variants) into one
 * consistent contract consumed by Quiz Engine & Quiz Arena UI.
 */

/**
 * Unescape double-escaped newline literals (e.g. `\\n` inside JSON strings)
 * without corrupting actual newlines.
 * @param {string} value
 * @returns {string}
 */
export function normalizeTextNewlines(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\\n/g, '\n')
}

/**
 * Normalize question type strings across schemas into canonical types:
 * 'multiple_choice' | 'fill_blank' | 'arrange_code'
 * @param {string} rawType
 * @returns {string}
 */
export function normalizeQuestionType(rawType) {
  const t = String(rawType || '').trim().toLowerCase()
  if (t === 'multiple_choice' || t === 'multiple choice') return 'multiple_choice'
  if (t === 'fill_blank' || t === 'fill_in_the_blank' || t === 'fill in the blank') return 'fill_blank'
  if (t === 'arrange_code' || t === 'arrange code') return 'arrange_code'
  return t || 'multiple_choice'
}

/**
 * Build assembled code string from fragment IDs and fragment definitions.
 * @param {Array<number|string>} orderIds
 * @param {Array<{id: number|string, code: string}>} fragments
 * @param {string} separator
 * @returns {string}
 */
export function assembleCodeFragments(orderIds, fragments, separator = ' ') {
  if (!Array.isArray(orderIds) || !Array.isArray(fragments)) return ''
  const byId = new Map(fragments.map((f) => [String(f.id), String(f.code ?? '')]))
  return orderIds
    .map((id) => byId.get(String(id)) ?? '')
    .join(separator)
    .trim()
}

/**
 * Strip embedded A/B/C/D option lines or numbered fragment previews from a
 * question stem when interactive option/chip UI elements render them separately.
 * @param {string} rawQuestion
 * @param {string} type
 * @returns {string}
 */
export function extractQuestionPrompt(rawQuestion, type) {
  const text = normalizeTextNewlines(rawQuestion).trim()
  if (!text) return ''

  if (type === 'multiple_choice') {
    const idx = text.search(/\n[A-D]\.\s/)
    return idx !== -1 ? text.slice(0, idx).trim() : text
  }

  if (type === 'arrange_code') {
    const potIdx = text.search(/\nPotongan kode:\s*\n/i)
    if (potIdx !== -1) return text.slice(0, potIdx).trim()
    const numIdx = text.search(/\n1\.\s/)
    return numIdx !== -1 ? text.slice(0, numIdx).trim() : text
  }

  return text
}

/**
 * Normalize fill-in-the-blank prompt and template code so both `question`-embedded
 * blanks (e.g. C# & Kotlin L1/L3-5) and `code_example`-embedded blanks (e.g. Kotlin L2)
 * render cleanly with canonical `___` markers.
 * @param {string} questionText
 * @param {string} codeExampleText
 * @returns {{ prompt: string, blankTemplate: string, codeExample: string }}
 */
function normalizeFillBlankFields(questionText, codeExampleText) {
  const qNorm = normalizeTextNewlines(questionText).trim()
  const ceNorm = normalizeTextNewlines(codeExampleText).trim()
  const blankRegex = /_{2,}/g

  const blankInQuestion = blankRegex.test(qNorm)
  blankRegex.lastIndex = 0
  const blankInCode = blankRegex.test(ceNorm)
  blankRegex.lastIndex = 0

  if (blankInQuestion) {
    // Split instruction line from inline code template if multiline
    const firstNewline = qNorm.indexOf('\n')
    if (firstNewline !== -1) {
      const instruction = qNorm.slice(0, firstNewline).trim()
      const template = qNorm.slice(firstNewline + 1).replace(blankRegex, '___').trim()
      return {
        prompt: instruction,
        blankTemplate: template,
        codeExample: ceNorm,
      }
    }
    return {
      prompt: qNorm.replace(blankRegex, '___'),
      blankTemplate: qNorm.replace(blankRegex, '___'),
      codeExample: ceNorm,
    }
  }

  if (blankInCode) {
    // Blank lives inside code_example (e.g. Kotlin Level 2 N05-N07)
    return {
      prompt: qNorm,
      blankTemplate: ceNorm.replace(blankRegex, '___'),
      codeExample: '',
    }
  }

  return {
    prompt: qNorm,
    blankTemplate: '',
    codeExample: ceNorm,
  }
}

/**
 * Normalize a single curriculum node.
 * @param {Object} rawNode
 * @param {number} index
 * @returns {Object}
 */
export function normalizeNode(rawNode, index = 0) {
  const type = normalizeQuestionType(rawNode.type || rawNode.question_type)
  const rawQuestion = rawNode.question || rawNode.interactive_question || ''
  const theory = normalizeTextNewlines(rawNode.theory || '').trim()
  let codeExample = normalizeTextNewlines(rawNode.code_example || '').trim()

  // Normalize options for multiple_choice
  const options = Array.isArray(rawNode.options)
    ? rawNode.options.map((opt, idx) => ({
        id: String(opt.id ?? opt.label ?? String.fromCharCode(97 + idx)).toLowerCase(),
        text: String(opt.text ?? ''),
      }))
    : []

  let correctOptionId = rawNode.correct_option_id
    ? String(rawNode.correct_option_id).toLowerCase()
    : null
  if (!correctOptionId && type === 'multiple_choice' && rawNode.correct_answer) {
    const match = String(rawNode.correct_answer).trim().match(/^([A-Da-d])/)
    if (match) correctOptionId = match[1].toLowerCase()
  }

  // Normalize fill_blank accepted answers
  let acceptedAnswers = Array.isArray(rawNode.accepted_answers)
    ? rawNode.accepted_answers.map((a) => String(a).trim()).filter(Boolean)
    : []
  if (!acceptedAnswers.length && type === 'fill_blank' && rawNode.correct_answer) {
    acceptedAnswers = [String(rawNode.correct_answer).trim()]
  }

  // Normalize arrange_code fragments & order
  const rawFragments = rawNode.answer_fragments || rawNode.code_fragments || []
  const answerFragments = Array.isArray(rawFragments)
    ? rawFragments.map((frag, idx) => ({
        id: frag.id ?? frag.number ?? idx + 1,
        code: String(frag.code ?? ''),
        description: frag.description ? String(frag.description) : '',
      }))
    : []

  const answerOrder = Array.isArray(rawNode.answer_order)
    ? rawNode.answer_order
    : Array.isArray(rawNode.correct_answer_order)
      ? rawNode.correct_answer_order
      : []

  const assemblySeparator = rawNode.assembly_separator !== undefined
    ? String(rawNode.assembly_separator)
    : ' '

  const correctCode = rawNode.correct_code
    ? String(rawNode.correct_code).trim()
    : type === 'arrange_code'
      ? assembleCodeFragments(answerOrder, answerFragments, assemblySeparator)
      : ''

  let questionPrompt = extractQuestionPrompt(rawQuestion, type)
  let blankTemplate = ''
  if (type === 'fill_blank') {
    const fb = normalizeFillBlankFields(rawQuestion, codeExample)
    questionPrompt = fb.prompt
    blankTemplate = fb.blankTemplate
    codeExample = fb.codeExample
  }

  const rawDialogue = String(rawNode.mascot_dialogue || rawNode.mascot || '').trim()
  const mascotDialogue = rawDialogue.length > 160
    ? `${rawDialogue.slice(0, 157)}...`
    : rawDialogue

  return {
    nodeId: rawNode.node_id || `NODE_${index + 1}`,
    number: rawNode.number ?? index + 1,
    title: String(rawNode.title || `Node ${index + 1}`),
    difficulty: String(rawNode.difficulty || 'beginner').toLowerCase(),
    type,
    theory,
    codeExample,
    question: normalizeTextNewlines(rawQuestion).trim(),
    questionPrompt,
    blankTemplate,
    options,
    correctOptionId,
    acceptedAnswers,
    answerFragments,
    answerOrder,
    assemblySeparator,
    correctCode,
    feedbackCorrect: String(rawNode.feedback_correct || rawNode.fc || 'Jawaban kamu benar!').trim(),
    feedbackIncorrect: String(rawNode.feedback_incorrect || rawNode.fi || 'Jawaban belum tepat, coba lagi!').trim(),
    mascotDialogue,
  }
}

/**
 * Normalize a full level JSON document into a standard Quiz Arena payload.
 * @param {Object} rawJson
 * @param {{ trackId?: string, levelId?: string, levelNum?: number }} [meta]
 * @returns {Object}
 */
export function normalizeLevelPayload(rawJson, meta = {}) {
  if (!rawJson || typeof rawJson !== 'object') {
    throw new Error('Data level JSON tidak valid atau kosong.')
  }

  const levelObj =
    rawJson.level ||
    (Array.isArray(rawJson.levels) && rawJson.levels[0]) ||
    rawJson.content_blueprint ||
    null

  if (!levelObj || !Array.isArray(levelObj.nodes) || levelObj.nodes.length === 0) {
    throw new Error(`Konten soal tidak ditemukan untuk level ${meta.levelId || meta.levelNum || ''}.`)
  }

  const nodes = levelObj.nodes.map((node, i) => normalizeNode(node, i))

  return {
    trackId: meta.trackId || '',
    courseId: rawJson.course_id || '',
    courseTitle: rawJson.course_title || levelObj.title || '',
    levelId: levelObj.level_id || meta.levelId || '',
    levelNumber: levelObj.level_number ?? meta.levelNum ?? 1,
    title: levelObj.title || '',
    description: levelObj.description || '',
    nodeCount: nodes.length,
    nodes,
  }
}
