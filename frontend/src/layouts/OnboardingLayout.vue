<script setup>
/**
 * OnboardingLayout
 * Template layout for the 4-step onboarding flow.
 * Slots: header (step indicator + back/skip), default (step content), footer (CTA button)
 */
import { computed } from 'vue'

const props = defineProps({
  currentStep: { type: Number, default: 0 }, // 0 = welcome, 1,2,3 = step 1-3
  totalSteps: { type: Number, default: 4 },
  showBack: { type: Boolean, default: false },
  showSkip: { type: Boolean, default: true },
})

const emit = defineEmits(['back', 'skip'])

// Step bars: show 4 indicator bars for steps 1-3 (hide on welcome screen step 0)
const showStepBars = computed(() => props.currentStep > 0)
</script>

<template>
  <div class="mobile-frame flex flex-col h-svh max-h-svh bg-[#0B0F19] overflow-hidden">

    <!-- Top Nav: Back + Step Indicators + Skip -->
    <div
      v-if="showStepBars"
      class="flex items-center justify-between px-4 pt-3 pb-2 gap-3 shrink-0"
      style="padding-top: max(14px, env(safe-area-inset-top))"
    >
      <!-- Back button -->
      <button
        v-if="showBack"
        @click="emit('back')"
        type="button"
        class="w-9 h-9 flex items-center justify-center rounded-full bg-[#13192B] border border-[#222B45] shrink-0 active:scale-95 transition-transform cursor-pointer"
        aria-label="Kembali"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 19L8 12L15 5" stroke="#8E9AB0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div v-else class="w-9 shrink-0" />

      <!-- Step indicator bars (4 bars) -->
      <div class="flex gap-1.5 flex-1">
        <div
          v-for="i in totalSteps"
          :key="i"
          class="step-bar flex-1"
          :class="i <= currentStep ? 'step-bar-active' : 'step-bar-inactive'"
        />
      </div>

      <!-- Skip button -->
      <button
        v-if="showSkip"
        @click="emit('skip')"
        type="button"
        class="text-sm text-[#8E9AB0] shrink-0 active:opacity-70 transition-opacity px-1 cursor-pointer font-medium"
      >
        Lewati
      </button>
      <div v-else class="w-12 shrink-0" />
    </div>

    <!-- Page content (flexible bounded container) -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      <slot />
    </div>

    <!-- Bottom CTA slot -->
    <div
      class="px-4 pb-4 pt-2.5 bg-[#0B0F19] shrink-0"
      style="padding-bottom: max(16px, env(safe-area-inset-bottom))"
    >
      <slot name="footer" />
    </div>

  </div>
</template>
