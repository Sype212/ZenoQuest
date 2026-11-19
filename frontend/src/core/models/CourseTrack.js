/**
 * @class CourseTrack
 * Domain entity representing a learning track (curriculum path).
 */
export class CourseTrack {
  /**
   * @param {Object} data
   * @param {string} data.id - unique track id e.g. 'html'
   * @param {string} data.title
   * @param {string} data.description
   * @param {string} data.badgeLabel - Short label: 'HTML' | 'CSS' | 'JS' | 'C#' | 'KT'
   * @param {string} data.accentColor - Hex color for badge background
   * @param {string} [data.badgeTextColor='#FFFFFF'] - Text color inside badge
   * @param {string} data.codeSnippet - Short syntax preview
   * @param {number} data.levelCount
   * @param {string[]} data.subTracks - Sub-tracks if any
   */
  constructor({
    id,
    title,
    description,
    badgeLabel,
    accentColor,
    badgeTextColor = '#FFFFFF',
    codeSnippet,
    levelCount = 5,
    subTracks = [],
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.badgeLabel = badgeLabel;
    this.accentColor = accentColor;
    this.badgeTextColor = badgeTextColor;
    this.codeSnippet = codeSnippet;
    this.levelCount = levelCount;
    this.subTracks = subTracks;
  }

  /** Factory: build all 5 available tracks */
  static getAll() {
    return [
      new CourseTrack({
        id: 'html',
        title: 'HTML Fundamentals',
        description: 'Struktur semantik web, form interaktif & multimedia',
        badgeLabel: 'HTML',
        accentColor: '#E44D26',
        badgeTextColor: '#FFFFFF',
        codeSnippet: '<h1>Hello World</h1>',
        levelCount: 5,
        subTracks: [],
      }),
      new CourseTrack({
        id: 'css',
        title: 'CSS Styling',
        description: 'Desain responsif, Flexbox, Grid layout & efek animasi',
        badgeLabel: 'CSS',
        accentColor: '#264DE4',
        badgeTextColor: '#FFFFFF',
        codeSnippet: 'display: flex; gap: 8px;',
        levelCount: 5,
        subTracks: [],
      }),
      new CourseTrack({
        id: 'js',
        title: 'JavaScript ES6+',
        description: 'Logika dinamis, manipulasi DOM, array & event interaktif',
        badgeLabel: 'JS',
        accentColor: '#F7DF1E',
        badgeTextColor: '#111827',
        codeSnippet: 'const ready = true;',
        levelCount: 5,
        subTracks: [],
      }),
      new CourseTrack({
        id: 'csharp',
        title: 'C# Fundamentals',
        description: 'Logika terstruktur, algoritma, dan pemrograman OOP',
        badgeLabel: 'C#',
        accentColor: '#8B5CF6',
        badgeTextColor: '#FFFFFF',
        codeSnippet: 'int level = 1;',
        levelCount: 5,
        subTracks: [],
      }),
      new CourseTrack({
        id: 'kotlin',
        title: 'Kotlin Mobile',
        description: 'Dasar sintaks ringkas untuk membangun aplikasi Android',
        badgeLabel: 'KT',
        accentColor: '#F97316',
        badgeTextColor: '#FFFFFF',
        codeSnippet: 'val status = "Go"',
        levelCount: 5,
        subTracks: [],
      }),
    ];
  }

  /** Find track by id */
  static findById(id) {
    return CourseTrack.getAll().find((t) => t.id === id) || null;
  }
}
