<script setup>
/**
 * AchievementBadgeIcon
 * Crisp neon SVG or track label icon for achievement cards and toast notifications.
 */
import { computed } from 'vue'

const props = defineProps({
  iconKey: { type: String, required: true },
  badgeLabel: { type: String, default: '' },
  color: { type: String, default: '#22C55E' },
  unlocked: { type: Boolean, default: true },
  size: { type: Number, default: 20 },
})

const TRACK_LABELS = {
  track_html: 'HTML',
  track_css: 'CSS',
  track_js: 'JS',
  track_csharp: 'C#',
  track_kotlin: 'KT',
}

const resolvedTrackText = computed(() =>
  props.badgeLabel || TRACK_LABELS[props.iconKey] || ''
)

const strokeColor = computed(() =>
  props.unlocked ? props.color : '#64748B'
)
</script>

<template>
  <span
    v-if="resolvedTrackText"
    class="font-extrabold tracking-tight select-none leading-none"
    :style="{ color: strokeColor, fontSize: size >= 20 ? '11.5px' : '10px' }"
  >
    {{ resolvedTrackText }}
  </span>

  <!-- Medal / Starter -->
  <svg
    v-else-if="iconKey === 'medal'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="6" :stroke="strokeColor" stroke-width="2" />
    <path
      d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"
      :stroke="strokeColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <!-- Bolt / XP & First Node -->
  <svg
    v-else-if="iconKey === 'bolt'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"
      :stroke="strokeColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>

  <!-- Trophy / Level Pecah -->
  <svg
    v-else-if="iconKey === 'trophy'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" />
    <path d="M4 22h16" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" :stroke="strokeColor" stroke-width="2" stroke-linejoin="round" />
  </svg>

  <!-- Heart / Perfect Run -->
  <svg
    v-else-if="iconKey === 'heart'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      :stroke="strokeColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>

  <!-- Diamond / 5 Perfect Runs -->
  <svg
    v-else-if="iconKey === 'diamond'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <polygon
      points="6 3 18 3 22 9 12 21 2 9 6 3"
      :stroke="strokeColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path d="M2 9h20M12 21L8 9l4-6 4 6-4 12z" :stroke="strokeColor" stroke-width="1.6" stroke-linejoin="round" />
  </svg>

  <!-- Star / XP Master -->
  <svg
    v-else-if="iconKey === 'star'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      :stroke="strokeColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>

  <!-- Target / 10 Nodes -->
  <svg
    v-else-if="iconKey === 'target'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" :stroke="strokeColor" stroke-width="2" />
    <circle cx="12" cy="12" r="5" :stroke="strokeColor" stroke-width="2" />
    <circle cx="12" cy="12" r="1.6" :fill="strokeColor" />
  </svg>

  <!-- Compass / Two Tracks -->
  <svg
    v-else-if="iconKey === 'compass'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" :stroke="strokeColor" stroke-width="2" />
    <polygon
      points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
      :stroke="strokeColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>

  <!-- Crown / All 5 Tracks -->
  <svg
    v-else-if="iconKey === 'crown'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4L3 18z"
      :stroke="strokeColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path d="M5 21h14" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" />
  </svg>

  <!-- Layers / 10 Levels -->
  <svg
    v-else-if="iconKey === 'layers'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" :stroke="strokeColor" stroke-width="2" stroke-linejoin="round" />
    <polyline points="2 12 12 17 22 12" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <polyline points="2 17 12 22 22 17" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <!-- Award / ZenoMaster (Fallback default) -->
  <svg
    v-else
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 2z"
      :stroke="strokeColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path d="M7 20l5-2 5 2" :stroke="strokeColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
