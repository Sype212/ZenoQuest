<script setup>
/**
 * AppShellLayout
 * Shared layout for the main 3-tab application shell.
 * Shows iOS-style frosted Bottom Navigation Bar (Materi / Belajar / Profil)
 * with spring-animated active dot indicator.
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

    <!-- Frosted Bottom Navigation Bar -->
    <nav
      class="shrink-0 flex items-center border-t border-[#1A2238] bg-[#0B0F19]/92 backdrop-blur-md"
      style="padding-bottom: max(6px, env(safe-area-inset-bottom, 0px))"
    >
      <button
        v-for="tab in tabs"
        :key="tab.name"
        @click="navigate(tab)"
        type="button"
        class="ios-press flex-1 flex flex-col items-center justify-center py-2 cursor-pointer relative"
        :class="activeTab === tab.name ? 'text-[#FF2B51]' : 'text-[#8E9AB0]'"
      >
        <!-- Active indicator red dot with spring transition -->
        <div class="h-2 flex items-center justify-center mb-0.5">
          <Transition name="nav-dot">
            <span
              v-if="activeTab === tab.name"
              class="w-1.5 h-1.5 rounded-full bg-[#FF2B51] shadow-[0_0_8px_rgba(255,43,81,0.9)]"
            />
          </Transition>
        </div>

        <!-- Tab Icons -->
        <div
          class="h-6 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.22,1.18,0.36,1)]"
          :class="activeTab === tab.name ? 'scale-105' : 'scale-100'"
        >
          <!-- Materi: Book icon -->
          <template v-if="tab.name === 'courses'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" :stroke="activeTab === 'courses' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-colors duration-200"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" :stroke="activeTab === 'courses' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-colors duration-200"/>
            </svg>
          </template>

          <!-- Peta: Compass icon -->
          <template v-else-if="tab.name === 'map'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" :stroke="activeTab === 'map' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" class="transition-colors duration-200"/>
              <polygon points="12,4 15,12 12,20 9,12" :stroke="activeTab === 'map' ? '#FF2B51' : '#8E9AB0'" stroke-width="1.8" :fill="activeTab === 'map' ? '#FF2B51' : 'none'" fill-opacity="0.3" transform="rotate(45 12 12)" class="transition-all duration-200"/>
            </svg>
          </template>

          <!-- Profil: User icon -->
          <template v-else>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" :stroke="activeTab === 'profile' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-colors duration-200"/>
              <circle cx="12" cy="7" r="4" :stroke="activeTab === 'profile' ? '#FF2B51' : '#8E9AB0'" stroke-width="2" class="transition-colors duration-200"/>
            </svg>
          </template>
        </div>

        <span class="text-[11px] font-semibold tracking-wide mt-0.5 transition-colors duration-200">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.nav-dot-enter-active {
  transition: transform 0.28s cubic-bezier(0.22, 1.25, 0.36, 1), opacity 0.2s ease;
}
.nav-dot-leave-active {
  transition: transform 0.16s ease-in, opacity 0.14s ease-in;
}
.nav-dot-enter-from,
.nav-dot-leave-to {
  transform: scale(0.2);
  opacity: 0;
}
</style>
