/**
 * @module themeEngine
 * Dynamic Theme Engine (PRD F-04 & NFR-03).
 * Resolves 4 color tokens + safe fallback for any track/level and applies
 * CSS custom properties synchronously (< 5 ms).
 */

import { DEFAULT_THEME, TRACK_THEMES } from '../../data/themes.js'

/**
 * Resolve theme configuration for a given track and level number.
 * Falls back safely to level 1 of the track, or DEFAULT_THEME.
 * @param {string} trackId
 * @param {number} [levelNum=1]
 * @returns {Object}
 */
export function resolveLevelTheme(trackId, levelNum = 1) {
  const list = TRACK_THEMES[trackId]
  if (!Array.isArray(list) || !list.length) {
    return { ...DEFAULT_THEME }
  }
  const exact = list.find((t) => t.levelNum === Number(levelNum))
  return { ...DEFAULT_THEME, ...(exact || list[0]) }
}

/**
 * Return inline CSS variables object for binding onto a view container.
 * @param {Object} theme
 * @returns {Record<string, string>}
 */
export function getThemeCssVars(theme = DEFAULT_THEME) {
  return {
    '--zq-bg-primary': theme.bgPrimary || DEFAULT_THEME.bgPrimary,
    '--zq-bg-surface': theme.bgSurface || DEFAULT_THEME.bgSurface,
    '--zq-accent': theme.accentColor || DEFAULT_THEME.accentColor,
    '--zq-text-primary': theme.textPrimary || DEFAULT_THEME.textPrimary,
  }
}

/**
 * Apply theme CSS custom properties to the document root (safe in SSR/Node tests).
 * @param {string} trackId
 * @param {number} [levelNum=1]
 * @returns {Object} applied theme
 */
export function applyLevelTheme(trackId, levelNum = 1) {
  const theme = resolveLevelTheme(trackId, levelNum)
  if (typeof document !== 'undefined' && document.documentElement) {
    const vars = getThemeCssVars(theme)
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v)
    })
  }
  return theme
}
