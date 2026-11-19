<script setup>
/**
 * TrackOptionCard
 * Selectable card for a learning track (HTML, CSS, JS, C#, Kotlin).
 */
defineProps({
  track: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})
defineEmits(['select'])
</script>

<template>
  <button
    @click="$emit('select', track.id)"
    type="button"
    class="card-base w-full text-left p-3.5 flex flex-col gap-2 active:scale-[0.98] transition-all cursor-pointer"
    :class="{ 'card-active': isSelected }"
  >
    <!-- Header: badge + title + status -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-3 min-w-0">
        <!-- Track badge -->
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-[12px] shrink-0 tracking-wide"
          :style="{
            backgroundColor: track.accentColor,
            color: track.badgeTextColor || '#FFFFFF'
          }"
        >
          {{ track.badgeLabel }}
        </div>
        <!-- Title + desc -->
        <div class="min-w-0">
          <div class="text-[15px] font-bold text-white truncate">{{ track.title }}</div>
          <div class="text-[12px] text-[#8E9AB0] mt-0.5 line-clamp-1">{{ track.description }}</div>
        </div>
      </div>

      <!-- Active / Pilih badge -->
      <div
        class="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors"
        :class="isSelected
          ? 'bg-[#FF2B51] text-white shadow-[0_0_8px_rgba(255,43,81,0.5)]'
          : 'border border-[#222B45] text-[#8E9AB0] bg-[#161D31]'"
      >
        {{ isSelected ? '✓ AKTIF' : 'PILIH' }}
      </div>
    </div>

    <!-- Code snippet footer -->
    <div class="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1A2238]">
      <code class="font-code text-[#8E9AB0] text-[12px] truncate max-w-[240px]">{{ track.codeSnippet }}</code>
      <span class="text-[11px] text-[#8E9AB0] font-medium shrink-0 ml-2">{{ track.levelCount }} Level</span>
    </div>
  </button>
</template>
