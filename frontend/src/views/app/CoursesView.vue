<script setup>
/**
 * CoursesView - Tab "Materi" (/courses)
 * Menampilkan semua 5 jalur kurikulum beserta progress masing-masing.
 * User bisa tap kartu untuk langsung masuk ke World Map jalur tersebut.
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShellLayout from '@/layouts/AppShellLayout.vue'
import MascotAvatar from '@/components/mascot/MascotAvatar.vue'
import { gameStore } from '@/stores/gameStore.js'
import { UserProfile } from '@/core/models/UserProfile.js'
import { CourseTrack } from '@/core/models/CourseTrack.js'
import { CurriculumService } from '@/core/services/CurriculumService.js'

const router = useRouter()

onMounted(() => {
  gameStore.refresh()
})

const profile = computed(() =>
  gameStore.state.profile ? UserProfile.fromJSON(gameStore.state.profile) : null
)
const stats       = computed(() => gameStore.state.stats)
const progressMap = computed(() => gameStore.state.progress || {})

const nickname = computed(() => profile.value?.nickname || 'Petualang')
const totalXp  = computed(() => stats.value?.xp ?? 0)

// All 5 tracks with reactive progress data
const tracksWithProgress = computed(() =>
  CourseTrack.getAll().map((track) => {
    const pct    = CurriculumService.getTrackProgress(track.id, progressMap.value)
    const levels = CurriculumService.getLevelsWithStatus(track.id, progressMap.value)
    const done   = levels.filter(l => l.isCompleted).length
    const active = levels.find(l => l.isActive)
    return { ...track, pct, done, total: levels.length, activeLevel: active }
  })
)

function goToMap(trackId) {
  router.push(`/map/${trackId}`)
}
</script>

<template>
  <AppShellLayout>
    <div class="flex flex-col h-full bg-[#0B0F19] overflow-hidden">

      <!-- ── HEADER ─────────────────────────────────────────────────────── -->
      <div
        class="shrink-0 px-5 pb-4 pt-4 border-b border-[#1A2238]"
        style="padding-top: max(16px, env(safe-area-inset-top))"
      >
        <!-- Greeting row -->
        <div class="flex items-center justify-between gap-3 mb-4">
          <div>
            <p class="text-[12px] text-[#8E9AB0]">Selamat belajar,</p>
            <h1 class="text-[20px] font-extrabold text-white leading-tight">{{ nickname }}</h1>
          </div>
          <MascotAvatar variant="idle" size="badge" />
        </div>

        <!-- XP summary bar -->
        <div class="flex items-center gap-3 p-3 rounded-xl bg-[#13192B] border border-[#222B45]">
          <div class="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#F7DF1E">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
            </svg>
            <span class="text-[15px] font-extrabold text-white">{{ totalXp }} XP</span>
            <span class="text-[12px] text-[#8E9AB0]">Total</span>
          </div>
          <div class="w-px h-4 bg-[#222B45]" />
          <div class="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#22C55E" stroke-width="0" fill="none"/>
              <path d="M22 4L12 14.01l-3-3" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <span class="text-[12px] text-[#8E9AB0]">
              {{ tracksWithProgress.reduce((s, t) => s + t.done, 0) }} Level Tamat
            </span>
          </div>
        </div>
      </div>

      <!-- ── TRACK LIST (scrollable) ────────────────────────────────────── -->
      <div class="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-5 py-4">

        <p class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest mb-3">
          Semua Jalur Pembelajaran
        </p>

        <div class="flex flex-col gap-3">
          <button
            v-for="track in tracksWithProgress"
            :key="track.id"
            @click="goToMap(track.id)"
            type="button"
            class="card-base w-full text-left p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform cursor-pointer"
            :class="track.id === profile?.selectedTrack ? 'card-active' : ''"
          >
            <!-- Row 1: Badge + Title + Progress label -->
            <div class="flex items-center gap-3">
              <!-- Badge -->
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-[13px] shrink-0"
                :style="{ backgroundColor: track.accentColor, color: track.badgeTextColor || '#fff' }"
              >{{ track.badgeLabel }}</div>

              <!-- Title / desc -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[15px] font-bold text-white truncate">{{ track.title }}</span>
                  <!-- "Jalur Aktif" badge if this is the user's main track -->
                  <span
                    v-if="track.id === profile?.selectedTrack"
                    class="shrink-0 text-[10px] font-bold bg-[rgba(255,43,81,0.15)] text-[#FF2B51] border border-[#FF2B51] px-1.5 py-0.5 rounded-full uppercase"
                  >Aktif</span>
                </div>
                <div class="text-[12px] text-[#8E9AB0] mt-0.5 truncate">{{ track.description }}</div>
              </div>

              <!-- % complete -->
              <div class="shrink-0 text-right">
                <span class="text-[14px] font-extrabold" :style="{ color: track.pct === 100 ? '#22C55E' : '#FF2B51' }">
                  {{ track.pct }}%
                </span>
                <div class="text-[10px] text-[#8E9AB0]">{{ track.done }}/{{ track.total }}</div>
              </div>
            </div>

            <!-- Row 2: Progress bar -->
            <div class="w-full h-1.5 bg-[#1A2238] rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{
                  width: track.pct + '%',
                  backgroundColor: track.pct === 100 ? '#22C55E' : track.accentColor
                }"
              />
            </div>

            <!-- Row 3: Active level info -->
            <div
              v-if="track.activeLevel"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1A2238]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF2B51">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              <span class="text-[12px] text-[#8E9AB0]">
                Level {{ track.activeLevel.num }} •
                <span class="text-white font-semibold">{{ track.activeLevel.title }}</span>
              </span>
            </div>
            <div
              v-else-if="track.pct === 100"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="text-[12px] text-[#22C55E] font-semibold">Jalur Selesai!</span>
            </div>
          </button>
        </div>
      </div>

    </div>
  </AppShellLayout>
</template>
