<script setup>
/**
 * AppShellLayout
 * Shared layout for the main 3-tab application shell.
 * Shows Bottom Navigation Bar (Materi / Peta / Profil).
 * Hides automatically on /onboarding and /quiz routes.
 */
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { StorageService } from '@/core/services/StorageService.js'

const router = useRouter()
const route = useRoute()

const profileData = StorageService.getProfile()
const xp = computed(() => {
  const stats = StorageService.getStats()
  return stats?.xp || 0
})
const hearts = computed(() => profileData?.hearts ?? 5)

const tabs = [
  { name: 'courses', label: 'Materi', path: '/courses' },
  { name: 'map',     label: 'Peta',   path: '/map/active' },
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
    const p = profileData?.selectedTrack || 'html'
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

    <!-- Bottom Navigation Bar -->
    <nav
      class="shrink-0 flex items-center border-t border-[#1A2238] bg-[#0B0F19]"
      style="padding-bottom: env(safe-area-inset-bottom, 0px)"
    >
      <button
        v-for="tab in tabs"
        :key="tab.name"
        @click="navigate(tab)"
        type="button"
        class="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer transition-all active:scale-95"
        :class="activeTab === tab.name ? 'text-[#FF2B51]' : 'text-[#8E9AB0]'"
      >
        <!-- Icons -->
        <template v-if="tab.name === 'courses'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" :stroke="activeTab === 'courses' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" :stroke="activeTab === 'courses' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        <template v-else-if="tab.name === 'map'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" :stroke="activeTab === 'map' ? '#FF2B51' : '#8E9AB0'" stroke-width="2"/>
            <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" :stroke="activeTab === 'map' ? '#FF2B51' : '#8E9AB0'" stroke-width="2"/>
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" :stroke="activeTab === 'map' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </template>
        <template v-else>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" :stroke="activeTab === 'profile' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" :stroke="activeTab === 'profile' ? '#FF2B51' : '#8E9AB0'" stroke-width="2"/>
          </svg>
        </template>
        <span class="text-[11px] font-semibold">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>
