/**
 * @module achievementEngine
 * Pure evaluation logic for computing player achievement metrics and detecting
 * newly unlocked badges from localStorage state snapshots.
 */

import { CurriculumService } from './CurriculumService.js'
import { ACHIEVEMENTS, TRACK_NODE_PREFIXES } from '../data/achievements.js'

/**
 * Derive normalized counters from raw game state.
 * @param {{ profile?: Object|null, stats?: Object|null, progress?: Object|null, nodeClaims?: string[] }} [snapshot]
 * @returns {{
 *   hasProfile: boolean,
 *   xp: number,
 *   perfectRunCount: number,
 *   nodeClaimsCount: number,
 *   completedLevelsCount: number,
 *   tracksWithCompletedLevel: number,
 *   fullyCompletedTracks: Set<string>,
 *   maxTrackNodes: number,
 * }}
 */
export function computeAchievementMetrics(snapshot = {}) {
  const { profile = null, stats = {}, progress = {}, nodeClaims = [] } = snapshot

  const uniqueClaims = Array.isArray(nodeClaims)
    ? [...new Set(nodeClaims.map((id) => String(id).trim()).filter(Boolean))]
    : []

  const trackNodeCounts = new Map(Object.keys(TRACK_NODE_PREFIXES).map((k) => [k, 0]))
  for (const claimId of uniqueClaims) {
    const upper = claimId.toUpperCase()
    for (const [trackId, prefix] of Object.entries(TRACK_NODE_PREFIXES)) {
      if (upper.startsWith(prefix)) {
        trackNodeCounts.set(trackId, (trackNodeCounts.get(trackId) ?? 0) + 1)
        break
      }
    }
  }

  let completedLevelsCount = 0
  if (progress && typeof progress === 'object') {
    for (const trackProgress of Object.values(progress)) {
      if (!trackProgress || typeof trackProgress !== 'object') continue
      for (const status of Object.values(trackProgress)) {
        if (status === 'completed') completedLevelsCount++
      }
    }
  }

  let tracksWithCompletedLevel = 0
  const fullyCompletedTracks = new Set()

  for (const [trackId, meta] of Object.entries(CurriculumService.TRACKS)) {
    const tp = progress?.[trackId] || {}
    const totalLevels = meta.levels.length
    const completedInTrack = meta.levels.filter((lvl) => tp[lvl.id] === 'completed').length

    if (completedInTrack > 0) tracksWithCompletedLevel++
    if (totalLevels > 0 && completedInTrack >= totalLevels) {
      fullyCompletedTracks.add(trackId)
    }
  }

  const maxTrackNodes = trackNodeCounts.size
    ? Math.max(...trackNodeCounts.values())
    : 0

  return {
    hasProfile: Boolean(profile),
    xp: Number(stats?.xp ?? 0),
    perfectRunCount: Array.isArray(stats?.perfectRunLevels) ? stats.perfectRunLevels.length : 0,
    nodeClaimsCount: uniqueClaims.length,
    completedLevelsCount,
    tracksWithCompletedLevel,
    fullyCompletedTracks,
    maxTrackNodes,
  }
}

/**
 * Return serializable public metadata for an achievement definition.
 * @param {Object} achievement
 * @returns {Object}
 */
export function serializeAchievement(achievement) {
  const { predicate: _predicate, ...meta } = achievement
  return meta
}

/**
 * Evaluate all achievements that satisfy conditions for the given state snapshot.
 * Returns empty array if user profile has not been created yet.
 * @param {Object} snapshot
 * @returns {string[]}
 */
export function evaluateUnlockedIds(snapshot = {}) {
  const metrics = computeAchievementMetrics(snapshot)
  if (!metrics.hasProfile) return []

  return ACHIEVEMENTS
    .filter((item) => item.predicate(metrics))
    .map((item) => item.id)
}

/**
 * Return achievement metadata objects newly earned (not yet in claimedIds).
 * @param {Object} snapshot
 * @param {string[]} [alreadyClaimedIds=[]]
 * @returns {Array<Object>}
 */
export function findNewlyUnlockedAchievements(snapshot = {}, alreadyClaimedIds = []) {
  const claimedSet = new Set(Array.isArray(alreadyClaimedIds) ? alreadyClaimedIds : [])
  const unlockedIds = new Set(evaluateUnlockedIds(snapshot))

  return ACHIEVEMENTS
    .filter((item) => unlockedIds.has(item.id) && !claimedSet.has(item.id))
    .map(serializeAchievement)
}

/**
 * Map full achievement catalog to UI-ready objects with `unlocked` boolean.
 * @param {string[]} [claimedIds=[]]
 * @returns {Array<Object>}
 */
export function getAchievementsWithStatus(claimedIds = []) {
  const claimedSet = new Set(Array.isArray(claimedIds) ? claimedIds : [])
  return ACHIEVEMENTS.map((item) => ({
    ...serializeAchievement(item),
    unlocked: claimedSet.has(item.id),
  }))
}
