<script setup>
/**
 * MascotAvatar
 * Displays the animated L3-Bot mascot inside a glowing circular frame.
 * Supports: 'idle' | 'hi' | 'explain' | 'happy' | 'sad' (plus legacy 'idol' -> 'idle').
 */
import { computed } from 'vue'
import L3MascotAnimated from './L3MascotAnimated.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'idle',
    validator: (v) => ['idle', 'hi', 'explain', 'happy', 'sad', 'idol'].includes(v),
  },
  size: {
    type: String,
    default: 'md', // '2xs' | 'xs' | 'badge' | 'sm' | 'md' | 'lg'
  },
  suitColor: {
    type: String,
    default: '#DC2626',
  },
  suitShadeColor: {
    type: String,
    default: '#B91C1C',
  },
})

const normalizedVariant = computed(() =>
  props.variant === 'idol' ? 'idle' : props.variant
)

const sizeMap = {
  '2xs': { frame: 'w-6 h-6 border-[1.5px]', mascot: 'w-4 h-4' },
  xs:    { frame: 'w-9 h-9 border-2', mascot: 'w-7 h-7' },
  badge: { frame: 'w-11 h-11 border-2', mascot: 'w-9 h-9' },
  sm:    { frame: 'w-20 h-20 border-[3px]', mascot: 'w-16 h-16' },
  md:    { frame: 'w-28 h-28 border-[3px]', mascot: 'w-24 h-24' },
  lg:    { frame: 'w-36 h-36 border-[3px]', mascot: 'w-32 h-32' },
}

const classes = computed(() => sizeMap[props.size] || sizeMap.md)
</script>

<template>
  <div
    class="mascot-ring rounded-full flex items-center justify-center bg-[#0B0F19] shrink-0 overflow-hidden"
    :class="classes.frame"
  >
    <div :class="classes.mascot" class="flex items-center justify-center">
      <L3MascotAnimated
        :variant="normalizedVariant"
        :suit-color="suitColor"
        :suit-shade-color="suitShadeColor"
      />
    </div>
  </div>
</template>
