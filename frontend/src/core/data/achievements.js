/**
 * @module achievements
 * Canonical catalog of unlockable ZenoQuest achievements and track node prefixes.
 */

export const TRACK_NODE_PREFIXES = {
  html: 'HTML_',
  css: 'CSS_',
  js: 'JS_',
  csharp: 'CSH_',
  kotlin: 'KTL_',
}

const TRACK_EXPERT_DEFINITIONS = [
  {
    id: 'full_track_html',
    trackId: 'html',
    title: 'HTML Expert',
    description: 'Tamatkan semua 5 level HTML Fundamentals',
    iconKey: 'track_html',
    badgeLabel: 'HTML',
    accentColor: '#E44D26',
  },
  {
    id: 'full_track_css',
    trackId: 'css',
    title: 'CSS Expert',
    description: 'Tamatkan semua 5 level CSS Styling',
    iconKey: 'track_css',
    badgeLabel: 'CSS',
    accentColor: '#264DE4',
  },
  {
    id: 'full_track_js',
    trackId: 'js',
    title: 'JS Expert',
    description: 'Tamatkan semua 5 level JavaScript ES6+',
    iconKey: 'track_js',
    badgeLabel: 'JS',
    accentColor: '#F7DF1E',
  },
  {
    id: 'full_track_csharp',
    trackId: 'csharp',
    title: 'C# Expert',
    description: 'Tamatkan semua 5 level C# Fundamentals',
    iconKey: 'track_csharp',
    badgeLabel: 'C#',
    accentColor: '#8B5CF6',
  },
  {
    id: 'full_track_kotlin',
    trackId: 'kotlin',
    title: 'Kotlin Expert',
    description: 'Tamatkan semua 5 level Kotlin Mobile',
    iconKey: 'track_kotlin',
    badgeLabel: 'KT',
    accentColor: '#F97316',
  },
]

const CORE_ACHIEVEMENTS = [
  {
    id: 'welcome',
    title: 'Petualang Baru',
    description: 'Bergabung di ZenoQuest dan mulai petualangan codingmu!',
    category: 'starter',
    iconKey: 'medal',
    accentColor: '#22C55E',
    predicate: (m) => m.hasProfile,
  },
  {
    id: 'first_node',
    title: 'Kode Pertama',
    description: 'Jawab benar 1 soal pertamamu',
    category: 'starter',
    iconKey: 'bolt',
    accentColor: '#F59E0B',
    predicate: (m) => m.nodeClaimsCount >= 1,
  },
  {
    id: 'first_level',
    title: 'Level Pecah',
    description: 'Tamatkan 1 level pertamamu',
    category: 'starter',
    iconKey: 'trophy',
    accentColor: '#22C55E',
    predicate: (m) => m.completedLevelsCount >= 1,
  },
  {
    id: 'perfect_1',
    title: 'Hati Baja',
    description: 'Tamatkan 1 level dengan 5 hati utuh',
    category: 'mastery',
    iconKey: 'heart',
    accentColor: '#FF2B51',
    predicate: (m) => m.perfectRunCount >= 1,
  },
  {
    id: 'perfect_5',
    title: 'Tanpa Cela',
    description: 'Raih 5× Perfect Run dengan 5 hati utuh',
    category: 'mastery',
    iconKey: 'diamond',
    accentColor: '#38BDF8',
    predicate: (m) => m.perfectRunCount >= 5,
  },
  {
    id: 'xp_100',
    title: 'Seratus Poin',
    description: 'Kumpulkan minimal 100 XP',
    category: 'milestone',
    iconKey: 'bolt',
    accentColor: '#F59E0B',
    predicate: (m) => m.xp >= 100,
  },
  {
    id: 'xp_500',
    title: 'XP Master',
    description: 'Kumpulkan minimal 500 XP',
    category: 'milestone',
    iconKey: 'star',
    accentColor: '#F59E0B',
    predicate: (m) => m.xp >= 500,
  },
  {
    id: 'all_nodes_1track',
    title: 'Kuasai Jalur',
    description: 'Selesaikan 10 soal di satu jalur belajar',
    category: 'mastery',
    iconKey: 'target',
    accentColor: '#FF2B51',
    predicate: (m) => m.maxTrackNodes >= 10,
  },
  {
    id: 'two_tracks',
    title: 'Penjelajah Ganda',
    description: 'Tamatkan min. 1 level di 2 jalur berbeda',
    category: 'tracks',
    iconKey: 'compass',
    accentColor: '#38BDF8',
    predicate: (m) => m.tracksWithCompletedLevel >= 2,
  },
  {
    id: 'all_tracks',
    title: 'Penakluk Lima Jalur',
    description: 'Tamatkan min. 1 level di semua 5 jalur',
    category: 'tracks',
    iconKey: 'crown',
    accentColor: '#F59E0B',
    predicate: (m) => m.tracksWithCompletedLevel >= 5,
  },
]

const TRACK_ACHIEVEMENTS = TRACK_EXPERT_DEFINITIONS.map((spec) => ({
  id: spec.id,
  trackId: spec.trackId,
  badgeLabel: spec.badgeLabel,
  title: spec.title,
  description: spec.description,
  category: 'tracks',
  iconKey: spec.iconKey,
  accentColor: spec.accentColor,
  predicate: (m) => m.fullyCompletedTracks.has(spec.trackId),
}))

const ENDGAME_ACHIEVEMENTS = [
  {
    id: '10_levels',
    title: 'Setengah Jalan',
    description: 'Tamatkan total 10 level di ZenoQuest',
    category: 'milestone',
    iconKey: 'layers',
    accentColor: '#38BDF8',
    predicate: (m) => m.completedLevelsCount >= 10,
  },
  {
    id: '25_levels',
    title: 'ZenoMaster',
    description: 'Tamatkan semua 25 level di seluruh jalur!',
    category: 'milestone',
    iconKey: 'award',
    accentColor: '#F59E0B',
    predicate: (m) => m.completedLevelsCount >= 25,
  },
]

/**
 * Ordered catalog of all 17 achievements.
 * @type {Array<{id: string, title: string, description: string, category: string, iconKey: string, accentColor: string, trackId?: string, badgeLabel?: string, predicate: (metrics: Object) => boolean}>}
 */
export const ACHIEVEMENTS = [
  ...CORE_ACHIEVEMENTS,
  ...TRACK_ACHIEVEMENTS,
  ...ENDGAME_ACHIEVEMENTS,
]
