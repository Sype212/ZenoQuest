/**
 * @class DailyTarget
 * Value object representing a daily study target option.
 */
export class DailyTarget {
  /**
   * @param {Object} data
   * @param {number} data.minutes
   * @param {string} data.label - Display label e.g. '5 Menit / Hari'
   * @param {string} data.subtitle - e.g. '1 Level per sesi latihan'
   * @param {boolean} data.isRecommended
   * @param {string} data.icon - icon name: 'clock' | 'bolt' | 'target'
   */
  constructor({ minutes, label, subtitle, isRecommended = false, icon }) {
    this.minutes = minutes;
    this.label = label;
    this.subtitle = subtitle;
    this.isRecommended = isRecommended;
    this.icon = icon;
  }

  /** All available daily target options */
  static getAll() {
    return [
      new DailyTarget({
        minutes: 5,
        label: '5 Menit / Hari',
        subtitle: '1 Level per sesi latihan',
        isRecommended: false,
        icon: 'clock',
      }),
      new DailyTarget({
        minutes: 10,
        label: '10 Menit / Hari',
        subtitle: '2 Level per hari (Paling Ideal)',
        isRecommended: true,
        icon: 'bolt',
      }),
      new DailyTarget({
        minutes: 15,
        label: '15 Menit / Hari',
        subtitle: 'Tamatkan 1 Biome penuh setiap hari',
        isRecommended: false,
        icon: 'target',
      }),
    ];
  }

  static findByMinutes(minutes) {
    return DailyTarget.getAll().find((t) => t.minutes === minutes) || null;
  }
}
