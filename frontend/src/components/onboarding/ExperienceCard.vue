<script setup>
/**
 * ExperienceCard
 * Two-option grid card for experience level selection.
 */
defineProps({
  id: { type: String, required: true },        // 'beginner' | 'intermediate'
  icon: { type: String, default: '📗' },
  label: { type: String, required: true },
  description: { type: String, default: '' },
  isSelected: { type: Boolean, default: false },
})
defineEmits(['select'])
</script>

<template>
  <button
    @click="$emit('select', id)"
    class="ios-press card-base p-4 flex flex-col gap-2 text-left cursor-pointer"
    :class="{ 'card-active': isSelected }"
  >
    <span class="text-2xl">{{ icon }}</span>
    <div class="text-[14px] font-bold text-white">{{ label }}</div>
    <div v-if="description" class="text-[12px] text-[#8E9AB0] leading-snug">{{ description }}</div>
  </button>
</template>
