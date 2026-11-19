<script setup>
/** MapView - Tab "Belajar" (/map/:trackId) placeholder */
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
<template>
  <div class="mobile-frame flex flex-col min-h-svh bg-[#0B0F19] items-center justify-center px-6">
    <div class="text-center flex flex-col items-center gap-4">
      <div class="text-5xl">🏔️</div>
      <h1 class="text-2xl font-extrabold text-white">Peta Level</h1>
      <p class="text-[#8E9AB0] text-sm">Track: <strong class="text-[#FF2B51]">{{ route.params.trackId }}</strong></p>
      <div class="card-base px-5 py-3">
        <span class="font-code text-[#FF2B51] text-sm">Phase 2: Coming soon...</span>
      </div>
    </div>
  </div>
</template>
