/**
 * @class StorageService
 * Singleton service encapsulating all localStorage interactions.
 * Uses the 'zq_' prefix for all keys as defined by PRD §6.
 * Swap localStorage for IndexedDB here without touching any UI component.
 */
export class StorageService {
  static SCHEMA_VERSION = '1.0';

  static KEYS = {
    SCHEMA: 'zq_schema_version',
    PROFILE: 'zq_profile',
    STATS: 'zq_stats',
    PROGRESS: 'zq_progress',
    NODE_CLAIMS: 'zq_node_claims',
    ACTIVE_SESSION: 'zq_active_session',
    ACHIEVEMENTS: 'zq_achievements',
  };

  /** Read and parse a JSON value. Returns null on error/missing. */
  static get(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Stringify and write a value. Returns false on QuotaExceeded. */
  static set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[StorageService] Write failed:', e);
      return false;
    }
  }

  /** Remove a single key */
  static remove(key) {
    window.localStorage.removeItem(key);
  }

  /** Clear all zq_ prefixed keys (reset progress) */
  static clearAll() {
    const keysToRemove = Object.values(StorageService.KEYS);
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  }

  // ─── Profile ─────────────────────────────────────────────────────────────

  static getProfile() {
    return StorageService.get(StorageService.KEYS.PROFILE);
  }

  static saveProfile(profileJSON) {
    return StorageService.set(StorageService.KEYS.PROFILE, profileJSON);
  }

  static hasProfile() {
    return Boolean(StorageService.getProfile());
  }

  // ─── Progress ─────────────────────────────────────────────────────────────

  /** Returns { [trackId]: { [levelId]: 'locked' | 'active' | 'completed' } } */
  static getProgress() {
    return StorageService.get(StorageService.KEYS.PROGRESS) || {};
  }

  static saveProgress(progress) {
    return StorageService.set(StorageService.KEYS.PROGRESS, progress);
  }

  // ─── XP & Stats ──────────────────────────────────────────────────────────

  static getStats() {
    const raw = StorageService.get(StorageService.KEYS.STATS);
    return {
      xp: raw?.xp ?? 0,
      levelsCompleted: raw?.levelsCompleted ?? 0,
      perfectRunLevels: Array.isArray(raw?.perfectRunLevels) ? raw.perfectRunLevels : [],
    };
  }

  static saveStats(stats) {
    const normalized = {
      xp: stats?.xp ?? 0,
      levelsCompleted: stats?.levelsCompleted ?? 0,
      perfectRunLevels: Array.isArray(stats?.perfectRunLevels) ? stats.perfectRunLevels : [],
    };
    return StorageService.set(StorageService.KEYS.STATS, normalized);
  }

  static addPerfectRun(levelId) {
    const stats = StorageService.getStats();
    if (!stats.perfectRunLevels.includes(levelId)) {
      stats.perfectRunLevels.push(levelId);
      StorageService.saveStats(stats);
      return true;
    }
    return false;
  }

  // ─── Node Claims (Anti-XP duplication) ───────────────────────────────────

  static getNodeClaims() {
    return StorageService.get(StorageService.KEYS.NODE_CLAIMS) || [];
  }

  static addNodeClaim(nodeId) {
    const claims = StorageService.getNodeClaims();
    if (!claims.includes(nodeId)) {
      claims.push(nodeId);
      StorageService.set(StorageService.KEYS.NODE_CLAIMS, claims);
      return true; // first time, award XP
    }
    return false; // already claimed
  }

  // ─── Active Session (Session Recovery) ───────────────────────────────────

  static getActiveSession() {
    return StorageService.get(StorageService.KEYS.ACTIVE_SESSION);
  }

  static saveActiveSession(session) {
    return StorageService.set(StorageService.KEYS.ACTIVE_SESSION, session);
  }

  static clearActiveSession() {
    StorageService.remove(StorageService.KEYS.ACTIVE_SESSION);
  }

  // ─── Achievements ────────────────────────────────────────────────────────

  static getAchievements() {
    const raw = StorageService.get(StorageService.KEYS.ACHIEVEMENTS);
    return {
      claimedIds: Array.isArray(raw?.claimedIds) ? raw.claimedIds : [],
    };
  }

  static getClaimedAchievements() {
    return StorageService.getAchievements().claimedIds;
  }

  static saveAchievements(data) {
    const claimedIds = Array.isArray(data?.claimedIds)
      ? [...new Set(data.claimedIds.map(String))]
      : [];
    return StorageService.set(StorageService.KEYS.ACHIEVEMENTS, { claimedIds });
  }

  static addClaimedAchievement(id) {
    if (!id) return false;
    const claimedIds = StorageService.getClaimedAchievements();
    if (!claimedIds.includes(id)) {
      claimedIds.push(id);
      StorageService.saveAchievements({ claimedIds });
      return true;
    }
    return false;
  }

  // ─── Schema Migration Guard ───────────────────────────────────────────────

  static initSchema() {
    const stored = StorageService.get(StorageService.KEYS.SCHEMA);
    if (stored !== StorageService.SCHEMA_VERSION) {
      // Future: run migrations here
      StorageService.set(StorageService.KEYS.SCHEMA, StorageService.SCHEMA_VERSION);
    }
  }
}
