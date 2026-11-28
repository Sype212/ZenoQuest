<script setup>
/**
 * DailyTargetCard
 * Selectable row card for daily study duration.
 */
defineProps({
  target: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})
defineEmits(['select'])

// Inline SVG icon map
const icons = {
  clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#8E9AB0" stroke-width="2"/><path d="M12 7v5l3 3" stroke="#8E9AB0" stroke-width="2" stroke-linecap="round"/></svg>`,
  bolt: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke="#FF2B51" stroke-width="2" stroke-linejoin="round" fill="#FF2B51" fill-opacity="0.2"/></svg>`,
  target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#8E9AB0" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="#8E9AB0" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="#8E9AB0"/></svg>`,
}
</script>

<template>
  <button
    @click="$emit('select', target.minutes)"
    class="ios-press card-base w-full flex items-center justify-between gap-3 p-4 cursor-pointer"
    :class="{ 'card-active': isSelected }"
  >
    <div class="flex items-center gap-3">
      <!-- Icon -->
      <div
        class="w-9 h-9 flex items-center justify-center rounded-full shrink-0"
        :class="isSelected ? 'bg-[rgba(255,43,81,0.15)]' : 'bg-[#0B0F19]'"
        v-html="icons[target.icon]"
      />
      <!-- Text -->
      <div class="text-left">
        <div class="text-[14px] font-bold text-white">{{ target.label }}</div>
        <div class="text-[12px] text-[#8E9AB0]">{{ target.subtitle }}</div>
      </div>
    </div>

    <!-- Recommended badge or Pilih badge -->
    <div
      class="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
      :class="target.isRecommended
        ? 'bg-[#FF2B51] text-white'
        : (isSelected ? 'bg-[rgba(255,43,81,0.15)] text-[#FF2B51] border border-[#FF2B51]' : 'border border-[#222B45] text-[#8E9AB0]')"
    >
      {{ target.isRecommended ? 'REKOMENDASI' : 'PILIH' }}
    </div>
  </button>
</template>
