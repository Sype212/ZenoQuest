<script setup>
/**
 * Step0Welcome - "Kuasai Koding Lewat Petualangan!" (Screen 1)
 * Hero screen with platform overview. No step bars shown.
 */
import MascotAvatar from '@/components/mascot/MascotAvatar.vue'

defineEmits(['next'])
</script>

<template>
  <div class="flex flex-col h-full min-h-0 overflow-y-auto scrollbar-hide px-5 py-2 justify-between">

    <!-- Main hero card -->
    <div class="card-base p-6 flex flex-col items-center text-center gap-4 my-auto">

      <!-- L3-QUEST badge -->
      <div class="px-3 py-1 rounded-full border border-[#FF2B51] bg-[rgba(255,43,81,0.1)]">
        <span class="text-[11px] font-bold text-[#FF2B51] tracking-widest uppercase">L3-Quest Platform</span>
      </div>

      <!-- Mascot -->
      <MascotAvatar variant="idol" size="lg" />

      <!-- Headline -->
      <div class="flex flex-col gap-2">
        <h1 class="text-[25px] font-extrabold text-white leading-tight">
          Kuasai Koding<br />Lewat Petualangan!
        </h1>
        <p class="text-[13px] text-[#8E9AB0] leading-relaxed">
          Belajar konsep pemrograman dari nol secara interaktif melalui tantangan biome bertahap.
        </p>
      </div>
    </div>

    <!-- Feature stats grid -->
    <div class="grid grid-cols-3 gap-2.5 mt-3 mb-1 shrink-0">
      <!-- Node count -->
      <div class="card-base p-3 flex flex-col items-center gap-1.5">
        <div class="w-9 h-9 rounded-full bg-[rgba(255,43,81,0.12)] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 10h16M4 14h10" stroke="#FF2B51" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="text-[14px] font-extrabold text-white">10 Node</span>
        <span class="text-[11px] text-[#8E9AB0] text-center">Teori &amp; Soal</span>
      </div>

      <!-- Tracks -->
      <div class="card-base p-3 flex flex-col items-center gap-1.5">
        <div class="w-9 h-9 rounded-full bg-[rgba(255,43,81,0.12)] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF2B51" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="text-[14px] font-extrabold text-white">5 Jalur</span>
        <span class="text-[11px] text-[#8E9AB0] text-center leading-tight">HTML, CSS, JS, C#, KT</span>
      </div>

      <!-- XP & Nyawa -->
      <div class="card-base p-3 flex flex-col items-center gap-1.5">
        <div class="w-9 h-9 rounded-full bg-[rgba(255,43,81,0.12)] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF2B51" fill-opacity="0.3" stroke="#FF2B51" stroke-width="1.5"/>
          </svg>
        </div>
        <span class="text-[14px] font-extrabold text-white">XP &amp; Nyawa</span>
        <span class="text-[11px] text-[#8E9AB0] text-center">Sistem 5 Hati</span>
      </div>
    </div>

  </div>
</template>
