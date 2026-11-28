import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import { ACHIEVEMENTS } from '../src/core/data/achievements.js'
import {
  computeAchievementMetrics,
  evaluateUnlockedIds,
  findNewlyUnlockedAchievements,
  getAchievementsWithStatus,
} from '../src/core/services/achievementEngine.js'
import { CurriculumService } from '../src/core/services/CurriculumService.js'
import { StorageService } from '../src/core/services/StorageService.js'

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

function buildAllCompletedProgress(trackIds = null) {
  const progress = {}
  const targets = trackIds || Object.keys(CurriculumService.TRACKS)
  for (const tid of targets) {
    const meta = CurriculumService.TRACKS[tid]
    progress[tid] = {}
    for (const lvl of meta.levels) {
      progress[tid][lvl.id] = 'completed'
    }
  }
  return progress
}

describe('achievements catalog & achievementEngine', () => {
  it('defines all 17 achievements including all 5 track experts with unique IDs', () => {
    assert.equal(ACHIEVEMENTS.length, 17)
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id))
    assert.equal(ids.size, 17)

    for (const trackId of ['html', 'css', 'js', 'csharp', 'kotlin']) {
      assert.ok(ids.has(`full_track_${trackId}`), `Missing full_track_${trackId}`)
    }
  })

  it('unlocks nothing when no user profile exists', () => {
    const unlocked = evaluateUnlockedIds({
      profile: null,
      stats: { xp: 500, perfectRunLevels: ['html_lvl_01'] },
      progress: buildAllCompletedProgress(['html']),
      nodeClaims: ['HTML_L01_N01'],
    })
    assert.deepEqual(unlocked, [])
  })

  it('unlocks starter, XP, perfect run, and single-track node milestones incrementally', () => {
    const profile = { nickname: 'Sype', selectedTrack: 'html' }

    // 1. Fresh profile unlocks welcome only
    assert.deepEqual(evaluateUnlockedIds({ profile, stats: {}, progress: {}, nodeClaims: [] }), ['welcome'])

    // 2. First node + 10 nodes in Kotlin unlocks first_node & all_nodes_1track
    const kotlinNodes = Array.from({ length: 10 }, (_, i) => `KTL_L01_N${String(i + 1).padStart(2, '0')}`)
    const afterNodes = evaluateUnlockedIds({
      profile,
      stats: { xp: 100, perfectRunLevels: [] },
      progress: {},
      nodeClaims: kotlinNodes,
    })
    assert.ok(afterNodes.includes('welcome'))
    assert.ok(afterNodes.includes('first_node'))
    assert.ok(afterNodes.includes('xp_100'))
    assert.ok(afterNodes.includes('all_nodes_1track'))
    assert.equal(afterNodes.includes('first_level'), false)

    // 3. Completing 1 level on 2 tracks with 1 perfect run
    const afterTwoTracks = evaluateUnlockedIds({
      profile,
      stats: { xp: 120, perfectRunLevels: ['html_lvl_01'] },
      progress: {
        html: { html_lvl_01: 'completed' },
        css: { css_lvl_01: 'completed' },
      },
      nodeClaims: kotlinNodes,
    })
    assert.ok(afterTwoTracks.includes('first_level'))
    assert.ok(afterTwoTracks.includes('perfect_1'))
    assert.ok(afterTwoTracks.includes('two_tracks'))
    assert.equal(afterTwoTracks.includes('all_tracks'), false)
  })

  it('detects per-track experts, 10_levels, all_tracks, and 25_levels ZenoMaster accurately', () => {
    const profile = { nickname: 'Master', selectedTrack: 'csharp' }

    // Complete all CSS & C# levels = 10 levels across 2 tracks
    const tenLevelsProgress = buildAllCompletedProgress(['css', 'csharp'])
    const mid = evaluateUnlockedIds({
      profile,
      stats: {
        xp: 520,
        perfectRunLevels: ['css_lvl_01', 'css_lvl_02', 'css_lvl_03', 'css_lvl_04', 'css_lvl_05'],
      },
      progress: tenLevelsProgress,
      nodeClaims: ['CSS_L01_N01'],
    })
    assert.ok(mid.includes('full_track_css'))
    assert.ok(mid.includes('full_track_csharp'))
    assert.equal(mid.includes('full_track_html'), false)
    assert.equal(mid.includes('full_track_js'), false)
    assert.equal(mid.includes('full_track_kotlin'), false)
    assert.ok(mid.includes('perfect_5'))
    assert.ok(mid.includes('xp_500'))
    assert.ok(mid.includes('10_levels'))
    assert.equal(mid.includes('25_levels'), false)

    // Complete all 25 levels across all 5 tracks
    const all25 = evaluateUnlockedIds({
      profile,
      stats: { xp: 2500, perfectRunLevels: ['html_lvl_01', 'css_lvl_01', 'js_lvl_01', 'csh_l01', 'kt_l01'] },
      progress: buildAllCompletedProgress(),
      nodeClaims: ['HTML_L01_N01'],
    })
    assert.ok(all25.includes('all_tracks'))
    assert.ok(all25.includes('full_track_html'))
    assert.ok(all25.includes('full_track_js'))
    assert.ok(all25.includes('full_track_kotlin'))
    assert.ok(all25.includes('25_levels'))
  })

  it('findNewlyUnlockedAchievements filters already claimed IDs and preserves status list names', () => {
    const snapshot = {
      profile: { nickname: 'Nova' },
      stats: { xp: 10, perfectRunLevels: [] },
      progress: {},
      nodeClaims: ['HTML_L01_N01'],
    }
    const newly = findNewlyUnlockedAchievements(snapshot, ['welcome'])
    assert.deepEqual(newly.map((a) => a.id), ['first_node'])

    const uiList = getAchievementsWithStatus(['welcome'])
    assert.equal(uiList.length, 17)
    const welcome = uiList.find((a) => a.id === 'welcome')
    const firstLevel = uiList.find((a) => a.id === 'first_level')
    assert.equal(welcome.unlocked, true)
    assert.equal(firstLevel.unlocked, false)
    assert.equal(firstLevel.title, 'Level Pecah') // Name stays visible even when locked
  })

  it('computeAchievementMetrics deduplicates duplicate node claim IDs', () => {
    const metrics = computeAchievementMetrics({
      profile: { nickname: 'A' },
      stats: {},
      progress: {},
      nodeClaims: ['HTML_L01_N01', 'HTML_L01_N01', 'HTML_L01_N02'],
    })
    assert.equal(metrics.nodeClaimsCount, 2)
    assert.equal(metrics.maxTrackNodes, 2)
  })
})

describe('StorageService achievements persistence', () => {
  beforeEach(() => {
    installLocalStorageMock()
  })

  it('persists claimed achievement IDs under zq_achievements without duplicates and clears on reset', () => {
    assert.deepEqual(StorageService.getClaimedAchievements(), [])
    assert.equal(StorageService.addClaimedAchievement('welcome'), true)
    assert.equal(StorageService.addClaimedAchievement('welcome'), false)
    assert.equal(StorageService.addClaimedAchievement('full_track_js'), true)

    assert.deepEqual(StorageService.getClaimedAchievements(), ['welcome', 'full_track_js'])
    assert.deepEqual(StorageService.get(StorageService.KEYS.ACHIEVEMENTS), {
      claimedIds: ['welcome', 'full_track_js'],
    })

    StorageService.clearAll()
    assert.deepEqual(StorageService.getClaimedAchievements(), [])
  })
})
