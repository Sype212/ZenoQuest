<script setup>
/**
 * AppShellLayout
 * Shared layout for the main 3-tab application shell.
 * Shows Bottom Navigation Bar (Materi / Peta / Profil) with active red dot indicator.
 * Hides automatically on /onboarding and /quiz routes.
 */
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { gameStore } from '@/stores/gameStore.js'

const router = useRouter()
const route  = useRoute()

onMounted(() => {
  gameStore.refresh()
})

const tabs = [
  { name: 'courses', label: 'Materi', path: '/courses' },
  { name: 'map',     label: 'Belajar', path: '/map/active' },
  { name: 'profile', label: 'Profil', path: '/profile' },
]

const activeTab = computed(() => {
  const n = route.name
  if (n === 'map') return 'map'
  if (n === 'profile') return 'profile'
  return 'courses'
})

function navigate(tab) {
  if (tab.name === 'map') {
    const p = gameStore.state.profile?.selectedTrack || 'html'
    router.push(`/map/${p}`)
  } else {
    router.push(tab.path)
  }
}
</script>

<template>
  <div class="mobile-frame flex flex-col h-svh bg-[#0B0F19] overflow-hidden">
    <!-- Main scrollable content -->
    <div class="flex-1 min-h-0 overflow-hidden relative">
      <slot />
    </div>

    <!-- Bottom Navigation Bar (matches mobile UI reference) -->
    <nav
      class="shrink-0 flex items-center border-t border-[#1A2238] bg-[#0B0F19]"
      style="padding-bottom: max(6px, env(safe-area-inset-bottom, 0px))"
    >
      <button
        v-for="tab in tabs"
        :key="tab.name"
        @click="navigate(tab)"
        type="button"
        class="flex-1 flex flex-col items-center justify-center py-2 cursor-pointer transition-all active:scale-95 relative"
        :class="activeTab === tab.name ? 'text-[#FF2B51]' : 'text-[#8E9AB0]'"
      >
        <!-- Active indicator red dot (persis sesuai referensi UI) -->
        <div class="h-1.5 flex items-center justify-center mb-0.5">
          <span
            v-if="activeTab === tab.name"
            class="w-1.5 h-1.5 rounded-full bg-[#FF2B51] shadow-[0_0_6px_rgba(255,43,81,0.9)]"
          />
        </div>

        <!-- Tab Icons -->
        <div class="h-6 flex items-center justify-center">
          <!-- Materi: Book icon -->
          <template v-if="tab.name === 'courses'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" :stroke="activeTab === 'courses' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" :stroke="activeTab === 'courses' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>

          <!-- Peta: Compass icon with diagonal needle -->
          <template v-else-if="tab.name === 'map'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" :stroke="activeTab === 'map' ? '#FF2B51' : '#8E9AB0'" stroke-width="2"/>
              <polygon points="12,4 15,12 12,20 9,12" :stroke="activeTab === 'map' ? '#FF2B51' : '#8E9AB0'" stroke-width="1.8" :fill="activeTab === 'map' ? '#FF2B51' : 'none'" fill-opacity="0.3" transform="rotate(45 12 12)"/>
            </svg>
          </template>

          <!-- Profil: User icon -->
          <template v-else>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" :stroke="activeTab === 'profile' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" :stroke="activeTab === 'profile' ? '#FF2B51' : '#8E9AB0'" stroke-width="2"/>
            </svg>
          </template>
        </div>

        <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>
