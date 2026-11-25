import { reactive } from 'vue';
import { UserProfile } from '../core/models/UserProfile.js';
import { StorageService } from '../core/services/StorageService.js';

/**
 * @module onboardingStore
 * Reactive state manager for the 4-step onboarding flow.
 * Tracks draft selections until the user commits on the final screen.
 */

const state = reactive({
  /** Current step index: 0 = Welcome, 1 = Track, 2 = Target, 3 = Profile */
  currentStep: 0,

  /** Draft profile being built across steps */
  draft: {
    selectedTrack: null,       // 'html' | 'css' | 'js' | 'csharp' | 'kotlin'
    experienceLevel: null,     // 'beginner' | 'intermediate'
    dailyTargetMinutes: 10,    // default recommended
    nickname: '',
  },
});

// ─── Step Navigation ─────────────────────────────────────────────────────────

function goToStep(step) {
  if (step >= 0 && step <= 3) {
    state.currentStep = step;
  }
}

function reset() {
  state.currentStep = 0;
  state.draft.selectedTrack = null;
  state.draft.experienceLevel = null;
  state.draft.dailyTargetMinutes = 10;
  state.draft.nickname = '';
}

function nextStep() {
  if (state.currentStep < 3) state.currentStep++;
}

function prevStep() {
  if (state.currentStep > 0) state.currentStep--;
}

function skipOnboarding() {
  // Allow skip only after step 1 (track selected)
  if (state.currentStep >= 1 && state.draft.selectedTrack) {
    _commitAndFinish();
    return true;
  }
  return false;
}

// ─── Draft Mutations ──────────────────────────────────────────────────────────

function selectTrack(trackId) {
  state.draft.selectedTrack = trackId;
}

function selectExperience(level) {
  state.draft.experienceLevel = level;
}

function selectDailyTarget(minutes) {
  state.draft.dailyTargetMinutes = minutes;
}

function setNickname(name) {
  state.draft.nickname = name;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function canProceedStep1() {
  return Boolean(state.draft.selectedTrack);
}

function canProceedStep2() {
  return Boolean(state.draft.experienceLevel) && state.draft.dailyTargetMinutes > 0;
}

function canProceedStep3() {
  const name = state.draft.nickname.trim();
  return name.length >= 3 && name.length <= 20;
}

// ─── Commit to localStorage ───────────────────────────────────────────────────

function _commitAndFinish() {
  const profile = new UserProfile({
    nickname: state.draft.nickname.trim() || 'Fall_Adventurer',
    selectedTrack: state.draft.selectedTrack || 'html',
    experienceLevel: state.draft.experienceLevel || 'beginner',
    dailyTargetMinutes: state.draft.dailyTargetMinutes,
    avatar: 'idle',
    hearts: 5,
    xp: 0,
  });

  StorageService.initSchema();
  StorageService.saveProfile(profile.toJSON());

  // Initialize progress: unlock first level for each of the 5 tracks
  const progress = {
    html:   { html_lvl_01: 'active', html_lvl_02: 'locked', html_lvl_03: 'locked', html_lvl_04: 'locked', html_lvl_05: 'locked' },
    css:    { css_lvl_01:  'active', css_lvl_02:  'locked', css_lvl_03:  'locked', css_lvl_04:  'locked', css_lvl_05:  'locked' },
    js:     { js_lvl_01:   'active', js_lvl_02:   'locked', js_lvl_03:   'locked', js_lvl_04:   'locked', js_lvl_05:   'locked' },
    csharp: { csh_l01:     'active', csh_l02:     'locked', csh_l03:     'locked', csh_l04:     'locked', csh_l05:     'locked' },
    kotlin: { kt_l01:      'active', kt_l02:      'locked', kt_l03:      'locked', kt_l04:      'locked', kt_l05:      'locked' },
  };
  StorageService.saveProgress(progress);
  StorageService.saveStats({ xp: 0, levelsCompleted: 0 });

  return profile;
}

function finishOnboarding() {
  return _commitAndFinish();
}

export const onboardingStore = {
  state,
  goToStep,
  reset,
  nextStep,
  prevStep,
  skipOnboarding,
  selectTrack,
  selectExperience,
  selectDailyTarget,
  setNickname,
  canProceedStep1,
  canProceedStep2,
  canProceedStep3,
  finishOnboarding,
};
