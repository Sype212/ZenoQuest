import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { normalizeLevelPayload } from '../src/core/services/levelNormalizer.js'
import { validateNodeAnswer } from '../src/core/services/quizEngine.js'

const TRACK_DIRS = [
  { trackId: 'csharp', dir: 'src/json/besar/c#' },
  { trackId: 'kotlin', dir: 'src/json/besar/kotlin' },
]

describe('Active Curriculum JSON Integrity (C# & Kotlin)', () => {
  for (const { trackId, dir } of TRACK_DIRS) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()

    it(`${trackId} has all 5 level JSON files`, () => {
      assert.equal(files.length, 5)
    })

    for (const file of files) {
      it(`${file} normalizes cleanly with 10 valid solvable nodes`, () => {
        const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
        const level = normalizeLevelPayload(raw, { trackId })

        assert.equal(level.nodes.length, 10, `${file} must have 10 nodes`)

        for (const node of level.nodes) {
          assert.ok(node.theory.length > 0, `${node.nodeId} missing theory`)
          assert.ok(node.questionPrompt.length > 0, `${node.nodeId} missing questionPrompt`)
          assert.ok(node.feedbackCorrect.length > 0, `${node.nodeId} missing feedbackCorrect`)
          assert.ok(node.feedbackIncorrect.length > 0, `${node.nodeId} missing feedbackIncorrect`)
          assert.ok(
            node.mascotDialogue.length > 0 && node.mascotDialogue.length <= 160,
            `${node.nodeId} mascotDialogue invalid length (${node.mascotDialogue.length})`
          )

          // Verify the declared answer validates as correct under quizEngine
          if (node.type === 'multiple_choice') {
            assert.equal(node.options.length, 4, `${node.nodeId} needs 4 options`)
            assert.equal(
              validateNodeAnswer(node, node.correctOptionId, { trackId }).isCorrect,
              true,
              `${node.nodeId} correctOptionId failed validation`
            )
          } else if (node.type === 'fill_blank') {
            assert.ok(node.acceptedAnswers.length >= 1, `${node.nodeId} needs acceptedAnswers`)
            assert.equal(
              validateNodeAnswer(node, node.acceptedAnswers[0], { trackId }).isCorrect,
              true,
              `${node.nodeId} acceptedAnswers[0] failed validation`
            )
          } else if (node.type === 'arrange_code') {
            assert.ok(node.answerFragments.length >= 2, `${node.nodeId} needs fragments`)
            assert.ok(node.answerOrder.length >= 2, `${node.nodeId} needs answerOrder`)
            assert.equal(
              validateNodeAnswer(node, node.answerOrder, { trackId }).isCorrect,
              true,
              `${node.nodeId} answerOrder failed validation`
            )
          } else {
            assert.fail(`Unexpected node type ${node.type} in ${node.nodeId}`)
          }
        }
      })
    }
  }
})
