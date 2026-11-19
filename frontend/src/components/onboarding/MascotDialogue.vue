<script setup>
/**
 * MascotDialogue
 * The small mascot avatar + step label bubble shown at the top of steps 1-3.
 * Props:
 *   step    - '1' | '2' | '3'
 *   title   - Main line text below step badge
 *   subtitle - Smaller description text
 */
import MascotAvatar from '@/components/mascot/MascotAvatar.vue'

defineProps({
  step: { type: String, default: '1' },
  stepLabel: { type: String, default: 'LANGKAH 1 DARI 3 • PILIH JALUR' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="card-base p-4 flex items-start gap-3">
    <!-- Mini mascot -->
    <MascotAvatar variant="idol" size="sm" class="shrink-0" />

    <!-- Text bubble -->
    <div class="flex flex-col gap-1">
      <span class="text-[11px] font-bold text-[#FF2B51] tracking-widest uppercase">
        {{ stepLabel }}
      </span>
      <p class="text-[14px] text-white leading-snug font-medium">
        <slot />
      </p>
      <p v-if="subtitle" class="text-[12px] text-[#8E9AB0]">{{ subtitle }}</p>
    </div>
  </div>
</template>
