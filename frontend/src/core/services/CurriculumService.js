import { normalizeLevelPayload } from './levelNormalizer.js'

/**
 * @class CurriculumService
 * Service untuk memuat metadata kurikulum dan data JSON level.
 * Menyediakan title, deskripsi, dan level progression tiap track.
 */
export class CurriculumService {

  /**
   * Static level metadata map (dari data JSON aktual).
   * Key: trackId, value: array level metadata
   */
  static TRACKS = {
    html: {
      courseTitle: 'HTML Fundamentals',
      levels: [
        { id: 'html_lvl_01', num: 1, title: 'Introduction to HTML',       topic: 'Dasar tag & struktur dokumen' },
        { id: 'html_lvl_02', num: 2, title: 'HTML Text & Formatting',      topic: 'Teks, link & pemformatan' },
        { id: 'html_lvl_03', num: 3, title: 'HTML Structure & Semantics',  topic: 'Div, section & semantik' },
        { id: 'html_lvl_04', num: 4, title: 'HTML Tables & Forms',         topic: 'Tabel & formulir interaktif' },
        { id: 'html_lvl_05', num: 5, title: 'HTML Problem Solving',        topic: 'Latihan soal lanjutan' },
      ],
    },
    css: {
      courseTitle: 'CSS Fundamentals',
      levels: [
        { id: 'css_lvl_01', num: 1, title: 'Introduction to CSS',          topic: 'Dasar CSS & cara penerapan' },
        { id: 'css_lvl_02', num: 2, title: 'CSS Colors, Text & Fonts',     topic: 'Warna, tipografi & font' },
        { id: 'css_lvl_03', num: 3, title: 'CSS Box Model',                topic: 'Border, padding & margin' },
        { id: 'css_lvl_04', num: 4, title: 'CSS Layout & Responsive',      topic: 'Display, posisi & responsif' },
        { id: 'css_lvl_05', num: 5, title: 'Flexbox, Grid & Responsive',   topic: 'Layout modern' },
      ],
    },
    js: {
      courseTitle: 'JavaScript ES6+',
      levels: [
        { id: 'js_lvl_01', num: 1, title: 'Introduction to JavaScript',    topic: 'Dasar JS & cara penghubungan' },
        { id: 'js_lvl_02', num: 2, title: 'Variables, Types & Operators',  topic: 'Variabel, tipe data & operator' },
        { id: 'js_lvl_03', num: 3, title: 'Functions & Control Flow',      topic: 'Fungsi & alur kontrol' },
        { id: 'js_lvl_04', num: 4, title: 'Loops, Arrays & DOM',           topic: 'Array, perulangan & DOM' },
        { id: 'js_lvl_05', num: 5, title: 'Modern JavaScript ES6+',        topic: 'Arrow fn, spread & async' },
      ],
    },
    csharp: {
      courseTitle: 'C# Fundamentals',
      levels: [
        { id: 'csh_l01', num: 1, title: 'Introduction to C#',              topic: 'Dasar C# & .NET platform' },
        { id: 'csh_l02', num: 2, title: 'Variables, Data Types & Ops',     topic: 'Tipe data & operator' },
        { id: 'csh_l03', num: 3, title: 'Input, Output & Conditionals',    topic: 'If-else & switch' },
        { id: 'csh_l04', num: 4, title: 'Loops & Arrays',                  topic: 'Perulangan & koleksi data' },
        { id: 'csh_l05', num: 5, title: 'Methods & Problem Solving',       topic: 'Fungsi & latihan lanjutan' },
      ],
    },
    kotlin: {
      courseTitle: 'Kotlin Mobile',
      levels: [
        { id: 'kt_l01', num: 1, title: 'Introduction to Kotlin',           topic: 'Dasar Kotlin & platform' },
        { id: 'kt_l02', num: 2, title: 'Variables, Types & Operators',     topic: 'Variabel & tipe data Kotlin' },
        { id: 'kt_l03', num: 3, title: 'Input, Output & Conditionals',     topic: 'When expression & if-else' },
        { id: 'kt_l04', num: 4, title: 'Loops and Arrays',                 topic: 'For, while & koleksi' },
        { id: 'kt_l05', num: 5, title: 'Functions & Problem Solving',      topic: 'Lambda & latihan lanjutan' },
      ],
    },
  }

  /**
   * Menggabungkan metadata level dengan status progress dari localStorage.
   * @param {string} trackId
   * @param {Object} progressMap - { [levelId]: 'locked' | 'active' | 'completed' }
   * @returns {Array} - array level dengan field tambahan: status, isActive, isCompleted, isLocked
   */
  static getLevelsWithStatus(trackId, progressMap = {}) {
    const meta = CurriculumService.TRACKS[trackId]
    if (!meta) return []

    const trackProgress = progressMap[trackId] || {}

    return meta.levels.map((level) => {
      const rawStatus = trackProgress[level.id] || 'locked'
      return {
        ...level,
        status: rawStatus,
        isCompleted: rawStatus === 'completed',
        isActive: rawStatus === 'active',
        isLocked: rawStatus === 'locked',
      }
    })
  }

  /**
   * Hitung persentase progress suatu track
   * @param {string} trackId
   * @param {Object} progressMap
   * @returns {number} 0-100
   */
  static getTrackProgress(trackId, progressMap = {}) {
    const levels = CurriculumService.getLevelsWithStatus(trackId, progressMap)
    if (!levels.length) return 0
    const completed = levels.filter((l) => l.isCompleted).length
    return Math.round((completed / levels.length) * 100)
  }

  /**
   * Ambil semua track dengan persentase progress
   * @param {Object} progressMap
   * @returns {Array}
   */
  static getAllTracksWithProgress(progressMap = {}) {
    return Object.entries(CurriculumService.TRACKS).map(([id, meta]) => ({
      id,
      courseTitle: meta.courseTitle,
      progress: CurriculumService.getTrackProgress(id, progressMap),
      levelsCount: meta.levels.length,
      completedCount: CurriculumService.getLevelsWithStatus(id, progressMap).filter(l => l.isCompleted).length,
    }))
  }

  /**
   * Cari metadata track & level dari levelId (contoh: 'csh_l01', 'kt_l02').
   * @param {string} levelId
   * @returns {{ trackId: string, courseTitle: string, level: Object, nextLevel: Object|null } | null}
   */
  static findLevelById(levelId) {
    for (const [trackId, meta] of Object.entries(CurriculumService.TRACKS)) {
      const idx = meta.levels.findIndex((l) => l.id === levelId)
      if (idx !== -1) {
        return {
          trackId,
          courseTitle: meta.courseTitle,
          level: meta.levels[idx],
          nextLevel: meta.levels[idx + 1] || null,
        }
      }
    }
    return null
  }

  /**
   * Dynamic loader: Muat dan normalkan konten JSON lengkap sebuah level untuk Quiz Arena.
   * File path berbeda berdasarkan track.
   */
  static async loadLevelContent(trackId, levelNum, levelId = '') {
    const loaders = {
      html:   (n) => import(`../../json/kecil/html/HTML_Fundamentals_Level_${n}.json`),
      css:    (n) => import(`../../json/kecil/css/CSS_Fundamentals_Level_${n}.json`),
      js:     (n) => {
        if (n === 3) return import('../../json/kecil/js/JavaScript_Fundamental_Level_3.json')
        if (n === 5) return import('../../json/kecil/js/JavaScript_Fundamental_Level_5.json')
        return import(`../../json/kecil/js/JavaScript_Fundamentals_Level_${n}.json`)
      },
      csharp: (n) => import(`../../json/besar/c#/CSharp_Level_${n}.json`),
      kotlin: (n) => import(`../../json/besar/kotlin/Kotlin_Level_${n}.json`),
    }
    const loader = loaders[trackId]
    if (!loader) throw new Error(`Unknown track: ${trackId}`)
    const module = await loader(levelNum)
    return normalizeLevelPayload(module.default, { trackId, levelId, levelNum })
  }
}
