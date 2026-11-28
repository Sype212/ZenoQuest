import { reactive } from 'vue'
import { StorageService } from '../core/services/StorageService.js'
import { CurriculumService } from '../core/services/CurriculumService.js'
import { calculateNodeXp, calculatePerfectRunBonus } from '../core/services/quizEngine.js'
import { findNewlyUnlockedAchievements } from '../core/services/achievementEngine.js'

/**
 * @module gameStore
 * Reactive application store synchronizing localStorage (`zq_*`) across views
 * (AppShell, Courses, WorldMap, Profile, QuizArena).
 */

const state = reactive({
  profile: StorageService.getProfile(),
  stats: StorageService.getStats(),
  progress: StorageService.getProgress(),
  nodeClaims: StorageService.getNodeClaims(),
  activeSession: StorageService.getActiveSession(),
  achievements: StorageService.getClaimedAchievements(),
  achievementToasts: [],
})

/**
 * Evaluate current progression snapshot, persist any newly earned achievements,
 * and enqueue celebratory toast banners when `notify` is enabled.
 * @param {{ notify?: boolean }} [options]
 * @returns {Array<Object>}
 */
function checkAndClaimAchievements({ notify = true } = {}) {
  if (!state.profile) {
    state.achievements = []
    return []
  }

  const newlyUnlocked = findNewlyUnlockedAchievements(
    {
      profile: state.profile,
      stats: state.stats,
      progress: state.progress,
      nodeClaims: state.nodeClaims,
    },
    state.achievements
  )

  if (!newlyUnlocked.length) return []

  for (const achievement of newlyUnlocked) {
    StorageService.addClaimedAchievement(achievement.id)
    if (notify && !state.achievementToasts.some((t) => t.id === achievement.id)) {
      state.achievementToasts.push(achievement)
    }
  }

  state.achievements = StorageService.getClaimedAchievements()
  return newlyUnlocked
}

function dismissAchievementToast(id) {
  if (!state.achievementToasts.length) return
  if (!id) {
    state.achievementToasts.shift()
    return
  }
  state.achievementToasts = state.achievementToasts.filter((item) => item.id !== id)
}

function refresh({ notifyAchievements = true } = {}) {
  state.profile = StorageService.getProfile()
  state.stats = StorageService.getStats()
  state.progress = StorageService.getProgress()
  state.nodeClaims = StorageService.getNodeClaims()
  state.activeSession = StorageService.getActiveSession()
  state.achievements = StorageService.getClaimedAchievements()
  checkAndClaimAchievements({ notify: notifyAchievements })
}

function updateProfile(patch) {
  if (!state.profile) return null
  const updated = { ...state.profile, ...patch }
  StorageService.saveProfile(updated)
  state.profile = updated
  return updated
}

/**
 * Claim +10 XP for a newly solved node (0 XP if already claimed).
 * @param {string} nodeId
 * @returns {number} awarded XP (10 or 0)
 */
function claimNodeXp(nodeId) {
  const claimed = StorageService.getNodeClaims()
  const xpEarned = calculateNodeXp({
    nodeId,
    claimedNodeIds: claimed,
    isCorrect: true,
  })
  if (xpEarned > 0) {
    StorageService.addNodeClaim(nodeId)
    const nextStats = {
      ...StorageService.getStats(),
      xp: (StorageService.getStats().xp ?? 0) + xpEarned,
    }
    StorageService.saveStats(nextStats)
    state.nodeClaims = StorageService.getNodeClaims()
    state.stats = nextStats
    checkAndClaimAchievements({ notify: true })
  }
  return xpEarned
}

/**
 * Persist active quiz session for crash/close recovery (PRD F-09).
 * @param {{ levelId: string, trackId: string, nodeIndex: number, currentHearts: number }} session
 */
function saveSession(session) {
  const payload = {
    ...session,
    updatedAt: new Date().toISOString(),
  }
  StorageService.saveActiveSession(payload)
  state.activeSession = payload
}

function clearSession() {
  StorageService.clearActiveSession()
  state.activeSession = null
}

/**
 * Mark level completed, unlock next level if locked, award Perfect Run (+20 XP)
 * once per level if all 5 hearts remain, and clear active session.
 * @param {{ trackId: string, levelId: string, currentHearts: number, maxHearts?: number }} params
 * @returns {{ perfectBonusXp: number, unlockedNextLevelId: string | null }}
 */
function completeLevel({ trackId, levelId, currentHearts, maxHearts = 5 }) {
  const progress = StorageService.getProgress()
  const trackProgress = { ...(progress[trackId] || {}) }
  trackProgress[levelId] = 'completed'

  const meta = CurriculumService.findLevelById(levelId)
  let unlockedNextLevelId = null
  if (meta?.nextLevel) {
    const nextId = meta.nextLevel.id
    if (!trackProgress[nextId] || trackProgress[nextId] === 'locked') {
      trackProgress[nextId] = 'active'
      unlockedNextLevelId = nextId
    }
  }

  progress[trackId] = trackProgress
  StorageService.saveProgress(progress)

  // Recompute total completed levels across all tracks
  let levelsCompleted = 0
  Object.values(progress).forEach((tp) => {
    Object.values(tp || {}).forEach((status) => {
      if (status === 'completed') levelsCompleted++
    })
  })

  const stats = StorageService.getStats()
  const perfectBonusXp = calculatePerfectRunBonus({
    levelId,
    currentHearts,
    maxHearts,
    claimedPerfectLevels: stats.perfectRunLevels,
  })

  if (perfectBonusXp > 0) {
    stats.perfectRunLevels.push(levelId)
    stats.xp += perfectBonusXp
  }
  stats.levelsCompleted = levelsCompleted
  StorageService.saveStats(stats)

  clearSession()
  refresh()

  return { perfectBonusXp, unlockedNextLevelId }
}

function resetAll() {
  StorageService.clearAll()
  state.achievementToasts = []
  refresh({ notifyAchievements: false })
}

export const gameStore = {
  state,
  refresh,
  updateProfile,
  claimNodeXp,
  saveSession,
  clearSession,
  completeLevel,
  checkAndClaimAchievements,
  dismissAchievementToast,
  resetAll,
}
