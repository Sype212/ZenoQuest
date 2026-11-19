/**
 * @class UserProfile
 * Domain entity representing the local player profile.
 * Encapsulates all player state: identity, chosen track, target, XP, hearts.
 */
export class UserProfile {
  /**
   * @param {Object} data
   * @param {string} data.nickname
   * @param {string} data.selectedTrack - 'html' | 'css' | 'js' | 'csharp' | 'kotlin'
   * @param {string} data.experienceLevel - 'beginner' | 'intermediate'
   * @param {number} data.dailyTargetMinutes
   * @param {string} data.avatar - 'idol' | 'happy'
   * @param {number} data.hearts
   * @param {number} data.xp
   * @param {string|null} data.createdAt
   */
  constructor({
    nickname = 'Fall_Adventurer',
    selectedTrack = 'html',
    experienceLevel = 'beginner',
    dailyTargetMinutes = 10,
    avatar = 'idol',
    hearts = 5,
    xp = 0,
    createdAt = null,
  } = {}) {
    this.nickname = nickname.trim();
    this.selectedTrack = selectedTrack;
    this.experienceLevel = experienceLevel;
    this.dailyTargetMinutes = dailyTargetMinutes;
    this.avatar = avatar;
    this.hearts = hearts;
    this.xp = xp;
    this.createdAt = createdAt || new Date().toISOString();
  }

  /** Validate required fields before saving */
  isValid() {
    return (
      this.nickname.length >= 3 &&
      this.nickname.length <= 20 &&
      Boolean(this.selectedTrack) &&
      this.dailyTargetMinutes > 0
    );
  }

  /** Serialize to plain object for localStorage */
  toJSON() {
    return {
      nickname: this.nickname,
      selectedTrack: this.selectedTrack,
      experienceLevel: this.experienceLevel,
      dailyTargetMinutes: this.dailyTargetMinutes,
      avatar: this.avatar,
      hearts: this.hearts,
      xp: this.xp,
      createdAt: this.createdAt,
    };
  }

  /** Rehydrate from plain object (deserialization) */
  static fromJSON(data) {
    return new UserProfile(data);
  }

  /** Human-friendly track display name */
  get trackDisplayName() {
    const map = {
      html: 'HTML Fundamentals',
      css: 'CSS Styling',
      js: 'JavaScript ES6+',
      csharp: 'C# Fundamentals',
      kotlin: 'Kotlin Mobile',
    };
    return map[this.selectedTrack] || this.selectedTrack;
  }

  /** Display label for daily target */
  get targetDisplayLabel() {
    return `${this.dailyTargetMinutes} Menit / Hari`;
  }

  /** Initial modal stat: 5 hearts + 0 XP string */
  get initialModal() {
    return `${this.hearts} Hati & ${this.xp} XP`;
  }
}
