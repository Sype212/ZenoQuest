import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import { normalizeNode, normalizeLevelPayload } from '../src/core/services/levelNormalizer.js'
import {
  validateNodeAnswer,
  calculateNodeXp,
  calculatePerfectRunBonus,
} from '../src/core/services/quizEngine.js'
import { resolveLevelTheme, getThemeCssVars } from '../src/core/services/themeEngine.js'
import { StorageService } from '../src/core/services/StorageService.js'
import { formatArrangedCodeLines, tokenizeCodeLine } from '../src/utils/codeSyntax.js'

// Mock window.localStorage for Node environment
function installLocalStorageMock() {
  const store = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    },
  }
  return store
}

describe('levelNormalizer', () => {
  it('normalizes Absen Besar single-level schema and unescapes literal \\n', () => {
    const raw = {
      course_id: 'kotlin_fundamentals',
      course_title: 'Kotlin Fundamentals',
      level: {
        level_id: 'KTL_L02',
        level_number: 2,
        title: 'Variables',
        nodes: [
          {
            node_id: 'KTL_L02_N05',
            type: 'fill_in_the_blank',
            theory: 'Double untuk desimal.',
            code_example: 'val itemCount: Int = 5\\nval price: ______ = 15000.75',
            question: 'Lengkapi tipe data.',
            accepted_answers: ['Double'],
            feedback_correct: 'Benar',
            feedback_incorrect: 'Salah',
            mascot_dialogue: 'Bagus!',
          },
        ],
      },
    }

    const payload = normalizeLevelPayload(raw, { trackId: 'kotlin' })
    assert.equal(payload.levelId, 'KTL_L02')
    assert.equal(payload.nodes.length, 1)
    const node = payload.nodes[0]
    assert.equal(node.type, 'fill_blank')
    assert.equal(node.blankTemplate, 'val itemCount: Int = 5\nval price: ___ = 15000.75')
    assert.equal(node.codeExample, '')
  })

  it('strips embedded A/B/C/D list in multiple_choice prompt', () => {
    const node = normalizeNode({
      node_id: 'CSH_L01_N01',
      type: 'multiple_choice',
      question: 'Apa itu C#?\nA. Bahasa\nB. OS\nC. Editor\nD. Game',
      options: [
        { id: 'a', text: 'Bahasa' },
        { id: 'b', text: 'OS' },
      ],
      correct_option_id: 'a',
    })
    assert.equal(node.questionPrompt, 'Apa itu C#?')
  })
})

describe('quizEngine', () => {
  it('validates multiple_choice accurately', () => {
    const node = normalizeNode({
      node_id: 'N1',
      type: 'multiple_choice',
      options: [{ id: 'a', text: 'Opt A' }, { id: 'b', text: 'Opt B' }],
      correct_option_id: 'b',
    })
    assert.equal(validateNodeAnswer(node, 'b').isCorrect, true)
    assert.equal(validateNodeAnswer(node, 'a').isCorrect, false)
    assert.equal(validateNodeAnswer(node, '').isEmpty, true)
  })

  it('enforces case-sensitivity for C#/Kotlin fill_blank and normalizes whitespace', () => {
    const node = normalizeNode({
      node_id: 'CSH_L02_N05',
      type: 'fill_in_the_blank',
      accepted_answers: ['Double'],
    })
    assert.equal(validateNodeAnswer(node, '  Double  ', { trackId: 'kotlin' }).isCorrect, true)
    assert.equal(validateNodeAnswer(node, 'double', { trackId: 'kotlin' }).isCorrect, false)
  })

  it('validates arrange_code by normalized joined code string (immune to duplicate chips)', () => {
    const node = normalizeNode({
      node_id: 'CSH_L01_N09',
      type: 'arrange_code',
      answer_fragments: [
        { id: 1, code: 'class Program' },
        { id: 2, code: '{' },
        { id: 3, code: 'Console.WriteLine();' },
        { id: 4, code: '{' }, // duplicate brace
        { id: 5, code: '}' },
      ],
      answer_order: [1, 2, 3, 5],
    })
    // Swapping fragment 2 and 4 (both '{') must still pass!
    assert.equal(validateNodeAnswer(node, [1, 4, 3, 5]).isCorrect, true)
    assert.equal(validateNodeAnswer(node, [1, 3, 4, 5]).isCorrect, false)
  })

  it('prevents duplicate XP on already-claimed nodes and awards Perfect Run once', () => {
    assert.equal(calculateNodeXp({ nodeId: 'CSH_L01_N01', claimedNodeIds: [], isCorrect: true }), 10)
    assert.equal(
      calculateNodeXp({ nodeId: 'CSH_L01_N01', claimedNodeIds: ['CSH_L01_N01'], isCorrect: true }),
      0
    )
    assert.equal(calculateNodeXp({ nodeId: 'CSH_L01_N01', claimedNodeIds: [], isCorrect: false }), 0)

    assert.equal(
      calculatePerfectRunBonus({ levelId: 'CSH_L01', currentHearts: 5, claimedPerfectLevels: [] }),
      20
    )
    assert.equal(
      calculatePerfectRunBonus({ levelId: 'CSH_L01', currentHearts: 4, claimedPerfectLevels: [] }),
      0
    )
    assert.equal(
      calculatePerfectRunBonus({
        levelId: 'CSH_L01',
        currentHearts: 5,
        claimedPerfectLevels: ['CSH_L01'],
      }),
      0
    )
  })
})

describe('StorageService & themeEngine', () => {
  beforeEach(() => {
    installLocalStorageMock()
  })

  it('persists zq_* keys and tracks perfectRunLevels without duplicating', () => {
    StorageService.initSchema()
    assert.equal(StorageService.get(StorageService.KEYS.SCHEMA), '1.0')
    assert.equal(StorageService.addNodeClaim('N1'), true)
    assert.equal(StorageService.addNodeClaim('N1'), false)
    assert.equal(StorageService.addPerfectRun('CSH_L01'), true)
    assert.equal(StorageService.addPerfectRun('CSH_L01'), false)
    assert.deepEqual(StorageService.getStats().perfectRunLevels, ['CSH_L01'])
  })

  it('resolves dynamic level theme and falls back safely for unknown tracks', () => {
    const csharpTheme = resolveLevelTheme('csharp', 1)
    assert.equal(csharpTheme.accentColor, '#8B5CF6')
    const fallbackTheme = resolveLevelTheme('unknown_track', 99)
    assert.equal(fallbackTheme.bgPrimary, '#0B0F19')
    const cssVars = getThemeCssVars(csharpTheme)
    assert.equal(cssVars['--zq-accent'], '#8B5CF6')
  })
})

describe('codeSyntax editor formatter', () => {
  it('formats HTML blocks with stacked indentation and restores closing indent', () => {
    const htmlDoc = [
      { id: 1, code: '<!DOCTYPE html><html>' },
      { id: 2, code: '<head><title>Profil</title></head>' },
      { id: 3, code: '<body><h1>Halo!</h1></body>' },
      { id: 4, code: '</html>' },
    ]
    const docLines = formatArrangedCodeLines(htmlDoc)
    assert.equal(docLines.length, 4)
    assert.deepEqual(docLines.map((l) => l.indentLevel), [0, 1, 1, 0])

    // Closing outer table should unwind unclosed inner rows
    const htmlTable = [
      { id: 1, code: '<table border="1">' },
      { id: 2, code: '<tr>' },
      { id: 3, code: '<td>Buku</td>' },
      { id: 4, code: '</table>' },
    ]
    const tableLines = formatArrangedCodeLines(htmlTable)
    assert.deepEqual(tableLines.map((l) => l.indentLevel), [0, 1, 2, 0])
  })

  it('keeps expression tokens and separator="" calls on a single editor line while indenting C# braces', () => {
    const inlineCall = formatArrangedCodeLines(
      [{ id: 1, code: 'console.log' }, { id: 2, code: '("Hello JS");' }],
      { assemblySeparator: '' }
    )
    assert.equal(inlineCall.length, 1)
    assert.equal(inlineCall[0].items.length, 2)

    const csharpExpr = formatArrangedCodeLines([
      { id: 1, code: 'int score' },
      { id: 2, code: '=' },
      { id: 3, code: '90' },
      { id: 4, code: ';' },
    ])
    assert.equal(csharpExpr.length, 1)
    assert.equal(csharpExpr[0].items.length, 4)

    const csharpClass = formatArrangedCodeLines([
      { id: 1, code: 'using System;' },
      { id: 2, code: 'class Program' },
      { id: 3, code: '{' },
      { id: 4, code: 'Console.WriteLine("Hi");' },
      { id: 5, code: '}' },
    ])
    assert.deepEqual(csharpClass.map((l) => l.indentLevel), [0, 0, 0, 1, 0])
    assert.ok(tokenizeCodeLine('<p>"ok"</p>').some((t) => t.text === '"ok"' || t.text.includes('<p>')))
  })
})
