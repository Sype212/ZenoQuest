import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { normalizeLevelPayload } from '../src/core/services/levelNormalizer.js'
import { validateNodeAnswer } from '../src/core/services/quizEngine.js'

const TRACK_DIRS = [
  { trackId: 'html',   courseId: 'html_fundamentals',       prefix: 'HTML', dir: 'src/json/kecil/html' },
  { trackId: 'css',    courseId: 'css_fundamentals',        prefix: 'CSS',  dir: 'src/json/kecil/css' },
  { trackId: 'js',     courseId: 'javascript_fundamentals', prefix: 'JS',   dir: 'src/json/kecil/js' },
  { trackId: 'csharp', courseId: 'csharp_fundamentals',     prefix: 'CSH',  dir: 'src/json/besar/c#' },
  { trackId: 'kotlin', courseId: 'kotlin_fundamentals',     prefix: 'KTL',  dir: 'src/json/besar/kotlin' },
]

describe('All Curriculum JSON Uniformity & Integrity (25 Levels / 250 Nodes)', () => {
  for (const { trackId, courseId, prefix, dir } of TRACK_DIRS) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()

    it(`${trackId} has all 5 level JSON files`, () => {
      assert.equal(files.length, 5)
    })

    for (const file of files) {
      it(`${file} matches unified schema and passes 10/10 node validation`, () => {
        const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))

        // Strict unified top-level schema assertions
        assert.equal(raw.schema_version, '1.0')
        assert.equal(raw.course_id, courseId)
        assert.ok(raw.level && typeof raw.level === 'object', `${file} missing root level object`)
        assert.ok(String(raw.level.level_id).startsWith(`${prefix}_L`), `${file} wrong level_id: ${raw.level.level_id}`)
        assert.equal(raw.level.nodes.length, 10, `${file} must have 10 nodes`)

        const level = normalizeLevelPayload(raw, { trackId })
        assert.equal(level.nodes.length, 10)

        raw.level.nodes.forEach((rn, i) => {
          const node = level.nodes[i]

          // Strict raw schema key checks
          assert.ok(
            ['multiple_choice', 'fill_blank', 'arrange_code'].includes(rn.type),
            `${rn.node_id} invalid raw type: ${rn.type}`
          )
          assert.ok(rn.feedback_correct?.length > 0, `${rn.node_id} missing feedback_correct`)
          assert.ok(rn.feedback_incorrect?.length > 0, `${rn.node_id} missing feedback_incorrect`)
          assert.ok(
            rn.mascot_dialogue?.length > 0 && rn.mascot_dialogue.length <= 160,
            `${rn.node_id} mascot_dialogue invalid length (${rn.mascot_dialogue?.length})`
          )
          assert.equal((rn.code_example || '').includes('\\n'), false, `${rn.node_id} has literal \\\\n`)

          // Normalized engine & content checks
          assert.ok(node.theory.length > 0, `${node.nodeId} missing theory`)
          assert.ok(node.questionPrompt.length > 0, `${node.nodeId} missing questionPrompt`)

          if (node.type === 'multiple_choice') {
            assert.equal(node.options.length, 4, `${node.nodeId} needs 4 options`)
            assert.ok(rn.correct_option_id, `${node.nodeId} missing correct_option_id`)
            assert.equal(
              validateNodeAnswer(node, node.correctOptionId, { trackId }).isCorrect,
              true,
              `${node.nodeId} correctOptionId failed validation`
            )
          } else if (node.type === 'fill_blank') {
            const hasCanonicalBlank = (rn.question + '\n' + rn.code_example).includes('___')
            assert.equal(hasCanonicalBlank, true, `${node.nodeId} missing canonical ___ blank`)
            assert.ok(node.acceptedAnswers.length >= 1, `${node.nodeId} needs acceptedAnswers`)
            assert.equal(
              validateNodeAnswer(node, node.acceptedAnswers[0], { trackId }).isCorrect,
              true,
              `${node.nodeId} acceptedAnswers[0] failed validation`
            )
          } else if (node.type === 'arrange_code') {
            assert.ok(rn.correct_code?.length > 0, `${node.nodeId} missing correct_code`)
            assert.ok(node.answerFragments.length >= 2, `${node.nodeId} needs fragments`)
            assert.ok(node.answerOrder.length >= 2, `${node.nodeId} needs answerOrder`)
            assert.equal(
              validateNodeAnswer(node, node.answerOrder, { trackId }).isCorrect,
              true,
              `${node.nodeId} answerOrder failed validation`
            )
            // Brace/paren balance check
            const code = rn.correct_code
            assert.equal((code.match(/\{/g) || []).length, (code.match(/\}/g) || []).length, `${node.nodeId} unbalanced braces`)
            assert.equal((code.match(/\(/g) || []).length, (code.match(/\)/g) || []).length, `${node.nodeId} unbalanced parens`)
          }
        })
      })
    }
  }
})
