<script setup>
/**
 * MascotAvatar
 * Displays the mascot image inside a glowing circular frame.
 * - idol.png  → welcome, track selection, target selection screens
 * - happy.png → profile setup screen
 */
import idolImg  from '@/assets/maskot/idol.png'
import happyImg from '@/assets/maskot/happy.png'

const props = defineProps({
  variant: {
    type: String,
    default: 'idol', // 'idol' | 'happy'
    validator: (v) => ['idol', 'happy'].includes(v),
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
  },
})

const sizeMap = {
  sm: { frame: 'w-20 h-20', img: 'w-16 h-16' },
  md: { frame: 'w-28 h-28', img: 'w-24 h-24' },
  lg: { frame: 'w-36 h-36', img: 'w-32 h-32' },
}

const imgSrc = props.variant === 'happy' ? happyImg : idolImg
const classes = sizeMap[props.size] || sizeMap.md
</script>

<template>
  <div
    class="mascot-ring rounded-full flex items-center justify-center bg-[#0B0F19]"
    :class="classes.frame"
  >
    <img
      :src="imgSrc"
      :alt="`Maskot ${variant}`"
      class="object-contain"
      :class="classes.img"
      draggable="false"
    />
  </div>
</template>
