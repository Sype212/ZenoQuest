/**
 * @module quizEngine
 * Pure domain logic for answer validation, Hearts management, XP anti-duplication,
 * and Perfect Run bonus evaluation per PRD v1.6 (§5.3, §5.5, §9 NFR-08).
 */

import { assembleCodeFragments } from './levelNormalizer.js'

const CASE_INSENSITIVE_TRACKS = new Set(['html', 'css'])

/**
 * Collapse consecutive whitespace to a single space and trim ends.
 * @param {string} value
 * @returns {string}
 */
export function normalizeWhitespace(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalize a fill-in-the-blank answer according to track rules (PRD §5.3):
 * - Always trim outer whitespace.
 * - For HTML: optionally strip angle brackets `< >` when comparing tag names.
 * - For C#, Kotlin, JavaScript: preserve case-sensitivity.
 * - For HTML, CSS: case-insensitive.
 * @param {string} value
 * @param {string} trackId
 * @param {boolean} [stripBrackets=false]
 * @returns {string}
 */
export function normalizeFillBlankAnswer(value, trackId = '', stripBrackets = false) {
  let out = String(value ?? '').trim()
  if (stripBrackets && trackId === 'html') {
    out = out.replace(/^<\/?/, '').replace(/>$/, '').trim()
  }
  if (CASE_INSENSITIVE_TRACKS.has(trackId)) {
    out = out.toLowerCase()
  }
  return out
}

/**
 * Validate a multiple choice selection against correctOptionId.
 * @param {Object} node - Normalized node
 * @param {string} selectedOptionId
 * @returns {boolean}
 */
export function validateMultipleChoice(node, selectedOptionId) {
  if (!selectedOptionId || !node?.correctOptionId) return false
  return String(selectedOptionId).trim().toLowerCase() === String(node.correctOptionId).trim().toLowerCase()
}

/**
 * Validate a fill-in-the-blank text input against acceptedAnswers.
 * @param {Object} node - Normalized node
 * @param {string} rawInput
 * @param {string} [trackId='']
 * @returns {boolean}
 */
export function validateFillBlank(node, rawInput, trackId = '') {
  const inputStr = String(rawInput ?? '').trim()
  if (!inputStr || !Array.isArray(node?.acceptedAnswers) || !node.acceptedAnswers.length) {
    return false
  }

  return node.acceptedAnswers.some((accepted) => {
    const cleanAccepted = normalizeFillBlankAnswer(accepted, trackId, false)
    const cleanInput = normalizeFillBlankAnswer(inputStr, trackId, false)
    if (cleanInput === cleanAccepted) return true

    // HTML tag convenience: allow `<strong>` or `</strong>` when accepted is `strong`
    if (trackId === 'html' && !/[<>]/.test(accepted)) {
      const strippedInput = normalizeFillBlankAnswer(inputStr, trackId, true)
      return strippedInput === cleanAccepted
    }
    return false
  })
}

/**
 * Validate an arrange_code submission by comparing normalized joined code string
 * against `node.correctCode` so duplicate chips (e.g. `{`, `}`, `</html>`) remain
 * interchangeable (PRD §5.3).
 * @param {Object} node - Normalized node
 * @param {Array<number|string>} selectedFragmentIds
 * @returns {boolean}
 */
export function validateArrangeCode(node, selectedFragmentIds) {
  if (!Array.isArray(selectedFragmentIds) || !selectedFragmentIds.length || !node?.correctCode) {
    return false
  }
  const assembled = assembleCodeFragments(
    selectedFragmentIds,
    node.answerFragments,
    node.assemblySeparator ?? ' '
  )
  return normalizeWhitespace(assembled) === normalizeWhitespace(node.correctCode)
}

/**
 * Dispatch validation across all 3 canonical interactive question types.
 * @param {Object} node - Normalized node
 * @param {*} userAnswer - Option id (string), text input (string), or fragment id array
 * @param {{ trackId?: string }} [context]
 * @returns {{ isCorrect: boolean, isEmpty: boolean }}
 */
export function validateNodeAnswer(node, userAnswer, context = {}) {
  const trackId = context.trackId || ''
  if (!node) return { isCorrect: false, isEmpty: true }

  switch (node.type) {
    case 'multiple_choice': {
      const val = String(userAnswer ?? '').trim()
      if (!val) return { isCorrect: false, isEmpty: true }
      return { isCorrect: validateMultipleChoice(node, val), isEmpty: false }
    }
    case 'fill_blank': {
      const val = String(userAnswer ?? '').trim()
      if (!val) return { isCorrect: false, isEmpty: true }
      return { isCorrect: validateFillBlank(node, val, trackId), isEmpty: false }
    }
    case 'arrange_code': {
      if (!Array.isArray(userAnswer) || userAnswer.length === 0) {
        return { isCorrect: false, isEmpty: true }
      }
      return { isCorrect: validateArrangeCode(node, userAnswer), isEmpty: false }
    }
    default:
      return { isCorrect: false, isEmpty: true }
  }
}

/**
 * Evaluate base XP earned for solving a node (+10 XP once per nodeId, +0 XP on replay).
 * @param {{ nodeId: string, claimedNodeIds: string[], isCorrect: boolean }} params
 * @returns {number}
 */
export function calculateNodeXp({ nodeId, claimedNodeIds = [], isCorrect }) {
  if (!isCorrect || !nodeId) return 0
  return claimedNodeIds.includes(nodeId) ? 0 : 10
}

/**
 * Evaluate Perfect Run bonus (+20 XP once per level if completed with all 5 hearts).
 * @param {{ levelId: string, currentHearts: number, maxHearts?: number, claimedPerfectLevels?: string[] }} params
 * @returns {number}
 */
export function calculatePerfectRunBonus({
  levelId,
  currentHearts,
  maxHearts = 5,
  claimedPerfectLevels = [],
}) {
  if (!levelId || currentHearts < maxHearts) return 0
  return claimedPerfectLevels.includes(levelId) ? 0 : 20
}
