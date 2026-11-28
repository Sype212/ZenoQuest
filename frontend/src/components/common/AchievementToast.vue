<script setup>
/**
 * AchievementToast
 * Dynamic Island-style global achievement notification banner.
 * Morphs from a compact glowing icon pill into the full achievement detail card,
 * holds for reading with a countdown indicator, then collapses back to icon pill.
 */
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { gameStore } from '@/stores/gameStore.js'
import AchievementBadgeIcon from '@/components/common/AchievementBadgeIcon.vue'

const ICON_HOLD_MS = 320
const EXPANDED_HOLD_MS = 2800
const COLLAPSE_MS = 380

const router = useRouter()
const queue = computed(() => gameStore.state.achievementToasts)
const currentToast = computed(() => queue.value[0] || null)
const remainingCount = computed(() => Math.max(0, queue.value.length - 1))

const phase = ref('icon-in') // 'icon-in' | 'expanded' | 'collapsing'
const detailContentRef = ref(null)
const expandedHeight = ref(78)

const isExpanded = computed(() => phase.value === 'expanded')
const accentColor = computed(() => currentToast.value?.accentColor || '#22C55E')

let expandTimer = null
let collapseTimer = null
let removeTimer = null

function clearAllTimers() {
  if (expandTimer) { clearTimeout(expandTimer); expandTimer = null }
  if (collapseTimer) { clearTimeout(collapseTimer); collapseTimer = null }
  if (removeTimer) { clearTimeout(removeTimer); removeTimer = null }
}

function measureExpandedHeight() {
  const innerHeight = detailContentRef.value?.scrollHeight || 56
  expandedHeight.value = Math.max(76, innerHeight + 22)
}

function collapseAndDismiss(toastId, navigateToProfile = false) {
  if (!toastId) return
  clearAllTimers()
  if (phase.value === 'expanded') {
    phase.value = 'collapsing'
    removeTimer = setTimeout(() => {
      gameStore.dismissAchievementToast(toastId)
      if (navigateToProfile) {
        router.push({ path: '/profile', query: { focus: 'achievements' } })
      }
    }, COLLAPSE_MS)
  } else {
    gameStore.dismissAchievementToast(toastId)
    if (navigateToProfile) {
      router.push({ path: '/profile', query: { focus: 'achievements' } })
    }
  }
}

function onIslandClick() {
  if (!currentToast.value) return
  collapseAndDismiss(currentToast.value.id, true)
}

function onCloseClick() {
  if (!currentToast.value) return
  collapseAndDismiss(currentToast.value.id, false)
}

watch(
  () => currentToast.value?.id,
  async (newId) => {
    clearAllTimers()
    if (!newId) {
      phase.value = 'icon-in'
      return
    }

    phase.value = 'icon-in'
    await nextTick()
    measureExpandedHeight()

    expandTimer = setTimeout(() => {
      if (currentToast.value?.id !== newId) return
      phase.value = 'expanded'

      collapseTimer = setTimeout(() => {
        if (currentToast.value?.id !== newId) return
        phase.value = 'collapsing'

        removeTimer = setTimeout(() => {
          if (currentToast.value?.id === newId) {
            gameStore.dismissAchievementToast(newId)
          }
        }, COLLAPSE_MS)
      }, EXPANDED_HOLD_MS)
    }, ICON_HOLD_MS)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearAllTimers()
})
</script>

<template>
  <div
    class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3 pt-2.5 z-[70] pointer-events-none flex justify-center"
    style="padding-top: max(10px, env(safe-area-inset-top))"
  >
    <Transition name="island-mount" mode="out-in">
      <div
        v-if="currentToast"
        :key="currentToast.id"
        @click="onIslandClick"
        role="status"
        aria-live="polite"
        data-testid="achievement-toast"
        :data-phase="phase"
        class="island-shell pointer-events-auto cursor-pointer border bg-[#0E1424]/95 backdrop-blur-md flex items-center relative overflow-hidden"
        :style="{
          width: isExpanded ? '100%' : '48px',
          height: isExpanded ? `${expandedHeight}px` : '48px',
          padding: isExpanded ? '10px 12px' : '5px',
          borderRadius: isExpanded ? '20px' : '9999px',
          borderColor: accentColor,
          boxShadow: isExpanded
            ? `0 12px 32px rgba(0,0,0,0.72), 0 0 22px ${accentColor}38`
            : `0 6px 20px rgba(0,0,0,0.65), 0 0 18px ${accentColor}55`
        }"
      >
        <!-- Glowing Icon Anchor (stays pinned on left while pill stretches outward) -->
        <div
          class="w-9 h-9 border-2 flex items-center justify-center shrink-0 transition-all duration-300"
          :class="[
            isExpanded ? 'rounded-xl' : 'rounded-full',
            phase === 'icon-in' ? 'scale-105' : 'scale-100'
          ]"
          :style="{
            borderColor: accentColor,
            backgroundColor: `${accentColor}22`
          }"
        >
          <AchievementBadgeIcon
            :icon-key="currentToast.iconKey"
            :badge-label="currentToast.badgeLabel || ''"
            :color="accentColor"
            :unlocked="true"
            :size="18"
          />
        </div>

        <!-- Expandable Detail Panel (Dynamic Island reveal) -->
        <div
          ref="detailContentRef"
          :aria-hidden="!isExpanded"
          class="flex-1 min-w-[220px] flex items-center gap-2.5 pl-3 transition-all"
          :class="isExpanded
            ? 'opacity-100 translate-x-0 duration-300 delay-150'
            : 'opacity-0 -translate-x-2 duration-150 pointer-events-none'"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <span
                class="text-[9.5px] font-extrabold uppercase tracking-widest truncate"
                :style="{ color: accentColor }"
              >
                Pencapaian Terbuka!
              </span>
              <span
                v-if="remainingCount > 0"
                class="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#1A2238] text-[#CBD5E1] border border-[#222B45]"
              >
                +{{ remainingCount }} lagi
              </span>
            </div>
            <div class="text-[14px] font-extrabold text-white truncate mt-0.5">
              {{ currentToast.title }}
            </div>
            <div class="text-[11.5px] text-[#CBD5E1] leading-snug line-clamp-2">
              {{ currentToast.description }}
            </div>
          </div>

          <button
            type="button"
            @click.stop="onCloseClick"
            aria-label="Tutup notifikasi pencapaian"
            class="w-7 h-7 rounded-lg bg-[#1A2238]/80 text-[#8E9AB0] hover:text-white flex items-center justify-center shrink-0 cursor-pointer text-[14px]"
          >
            ×
          </button>
        </div>

        <!-- Auto-dismiss progress line visible when expanded -->
        <div
          v-if="isExpanded"
          class="island-progress-bar absolute bottom-0 left-0 h-[2.5px]"
          :style="{
            backgroundColor: accentColor,
            animationDuration: `${EXPANDED_HOLD_MS}ms`
          }"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.island-shell {
  transition:
    width 0.44s cubic-bezier(0.22, 1.15, 0.36, 1),
    height 0.38s cubic-bezier(0.22, 1.1, 0.36, 1),
    padding 0.34s ease,
    border-radius 0.38s ease,
    box-shadow 0.34s ease;
  will-change: width, height, border-radius;
}

.island-mount-enter-active {
  transition: transform 0.24s cubic-bezier(0.22, 1.25, 0.36, 1), opacity 0.18s ease;
}

.island-mount-leave-active {
  transition: transform 0.18s ease-in, opacity 0.16s ease;
}

.island-mount-enter-from {
  transform: translateY(-16px) scale(0.65);
  opacity: 0;
}

.island-mount-leave-to {
  transform: translateY(-10px) scale(0.6);
  opacity: 0;
}

@keyframes islandCountdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.island-progress-bar {
  animation-name: islandCountdown;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>
