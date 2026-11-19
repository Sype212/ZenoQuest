<script setup>
/**
 * OnboardingView
 * Orchestrator for the 4-screen onboarding flow.
 * Controls step transitions, delegates mutations to onboardingStore,
 * and navigates to /courses upon completion.
 *
 * Step mapping:
 *   0 → Step0Welcome     (no nav bar, no step indicators)
 *   1 → Step1TrackSelect (step bars: 1 active)
 *   2 → Step2TargetSelect(step bars: 1,2 active)
 *   3 → Step3ProfileSetup(step bars: 1,2,3 active)
 */
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import OnboardingLayout from '@/layouts/OnboardingLayout.vue'
import Step0Welcome     from './steps/Step0Welcome.vue'
import Step1TrackSelect from './steps/Step1TrackSelect.vue'
import Step2TargetSelect from './steps/Step2TargetSelect.vue'
import Step3ProfileSetup from './steps/Step3ProfileSetup.vue'
import { onboardingStore } from '@/stores/onboardingStore.js'

const router = useRouter()
const store  = onboardingStore
const { state } = store

onMounted(() => {
  store.goToStep(0)
})

// Direction for slide transition: 'left' (forward) | 'right' (backward)
const direction = ref('left')

const stepComponents = [Step0Welcome, Step1TrackSelect, Step2TargetSelect, Step3ProfileSetup]
const currentStepComponent = computed(() => stepComponents[state.currentStep])

// ─── Computed helpers ─────────────────────────────────────────────────────────

/** Step bars count: steps 1-3 show 4 bars (3 step bars + 1 for profile step) */
const stepBarCount = computed(() => 4)

/** Active bar fill: step 1 → 1 bar, step 2 → 2 bars, step 3 → 3 bars, step 3 done → 4 bars */
const activeBarCount = computed(() => {
  if (state.currentStep === 0) return 0
  return state.currentStep
})

/** Show Back button only on steps 1-3 */
const showBack = computed(() => state.currentStep > 0)

/** Show Skip only on steps 1 and 2 (not on welcome or profile) */
const showSkip = computed(() => state.currentStep >= 1 && state.currentStep <= 2)

/** CTA button label per step */
const ctaLabel = computed(() => {
  switch (state.currentStep) {
    case 0: return 'Pilih Jalur Belajar →'
    case 1: return 'Atur Target Belajar →'
    case 2: return 'Lengkapi Profil →'
    case 3: return 'Masuk ke Dunia Game ▶'
    default: return 'Lanjut →'
  }
})

/** CTA disabled state per step */
const ctaDisabled = computed(() => {
  switch (state.currentStep) {
    case 1: return !store.canProceedStep1()
    case 2: return !store.canProceedStep2()
    case 3: return !store.canProceedStep3()
    default: return false
  }
})

// ─── Event Handlers ───────────────────────────────────────────────────────────

function onNext() {
  if (ctaDisabled.value) return

  if (state.currentStep === 3) {
    // Final step: commit profile and navigate to app
    store.finishOnboarding()
    router.replace({ name: 'courses' })
    return
  }

  direction.value = 'left'
  store.nextStep()
}

function onBack() {
  direction.value = 'right'
  store.prevStep()
}

function onSkip() {
  // Skip to profile step (step 3) with defaults
  if (!state.draft.selectedTrack) state.draft.selectedTrack = 'html'
  if (!state.draft.experienceLevel) state.draft.experienceLevel = 'beginner'
  direction.value = 'left'
  store.goToStep(3)
}
</script>

<template>
  <OnboardingLayout
    :current-step="activeBarCount"
    :total-steps="stepBarCount"
    :show-back="showBack"
    :show-skip="showSkip"
    @back="onBack"
    @skip="onSkip"
  >

    <!-- ── Animated step content ───────────────────────────────────────── -->
    <div class="relative flex-1 flex flex-col min-h-0 overflow-hidden">
      <Transition :name="`slide-${direction}`" mode="out-in">
        <component
          :is="currentStepComponent"
          :key="state.currentStep"
          class="h-full"
          :selected-track="state.draft.selectedTrack"
          :selected-experience="state.draft.experienceLevel"
          :selected-minutes="state.draft.dailyTargetMinutes"
          :nickname="state.draft.nickname"
          @select="store.selectTrack($event)"
          @selectExperience="store.selectExperience($event)"
          @selectMinutes="store.selectDailyTarget($event)"
          @update:nickname="store.setNickname($event)"
        />
      </Transition>
    </div>

    <!-- ── CTA Button ─────────────────────────────────────────────────── -->
    <template #footer>
      <button
        class="btn-cta"
        :disabled="ctaDisabled"
        @click="onNext"
      >
        {{ ctaLabel.toUpperCase() }}
      </button>
    </template>

  </OnboardingLayout>
</template>
