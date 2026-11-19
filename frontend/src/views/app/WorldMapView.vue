<script setup>
/**
 * WorldMapView - Tab "Peta" (/map/:trackId)
 * Peta level vertikal dengan zigzag layout.
 * - Level status: Locked / Active / Completed
 * - Ambil data dari CurriculumService dan localStorage progress
 * - Sesuaikan dengan track yang dipilih user
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShellLayout from '@/layouts/AppShellLayout.vue'
import MascotAvatar from '@/components/mascot/MascotAvatar.vue'
import { StorageService } from '@/core/services/StorageService.js'
import { UserProfile } from '@/core/models/UserProfile.js'
import { CourseTrack } from '@/core/models/CourseTrack.js'
import { CurriculumService } from '@/core/services/CurriculumService.js'

const route  = useRoute()
const router = useRouter()

// ─── Load Profile & Progress ──────────────────────────────────────────────────
const profileData = StorageService.getProfile()
const profile     = profileData ? UserProfile.fromJSON(profileData) : null
const stats       = StorageService.getStats()
const progressMap = StorageService.getProgress()

const xp     = computed(() => stats?.xp     ?? 0)
const hearts = computed(() => profile?.hearts ?? 5)

// ─── Active Track ─────────────────────────────────────────────────────────────
// Priority: URL param → user's selected track
const activeTrackId = ref(route.params.trackId || profile?.selectedTrack || 'html')
const allTracks     = CourseTrack.getAll()
const activeTrack   = computed(() => CourseTrack.findById(activeTrackId.value) || allTracks[0])

// Track dropdown
const showTrackMenu = ref(false)

function switchTrack(trackId) {
  activeTrackId.value = trackId
  showTrackMenu.value = false
  router.replace(`/map/${trackId}`)
}

// ─── Levels ───────────────────────────────────────────────────────────────────
const levels = computed(() =>
  CurriculumService.getLevelsWithStatus(activeTrackId.value, progressMap)
)

// Reverse levels for bottom-to-top display
const levelsDisplayed = computed(() => [...levels.value].reverse())

// Boss gate = unlocked if all 5 levels are completed
const bossUnlocked = computed(() => levels.value.every(l => l.isCompleted))

// ─── Zigzag positions ─────────────────────────────────────────────────────────
// Position classes alternating: center → left-offset → right-offset → left-offset → center
const positionClasses = [
  'self-center',           // Boss Gate (top)
  'self-start ml-14',      // Level 5 (top-left)
  'self-end mr-14',        // Level 4 (top-right)
  'self-start ml-14',      // Level 3 (mid-left)
  'self-end mr-14',        // Level 2 (mid-right)
  'self-center',           // Level 1 (bottom, center)
]

// Tips card dismiss
const showTip = ref(true)
const tipMessage = computed(() => {
  const track = activeTrackId.value
  const tips = {
    html: 'Gunakan tag <main> untuk membungkus konten inti agar struktur halamanmu ramah SEO dan rapi!',
    css:  'Gunakan CSS Custom Properties (variabel) untuk warna & ukuran agar kode lebih mudah diubah!',
    js:   'Gunakan const untuk nilai yang tidak berubah, baru let untuk yang bisa berubah!',
    csharp: 'Biasakan menulis komentar // pada setiap blok kode agar lebih mudah dibaca tim!',
    kotlin: 'Kotlin null-safety menjaga aplikasimu dari crash: gunakan ?. untuk akses aman!',
  }
  return tips[track] || tips.html
})
</script>

<template>
  <AppShellLayout>
    <div class="flex flex-col h-full bg-[#0B0F19] overflow-hidden">

      <!-- ── TOP HUD ─────────────────────────────────────────────────────── -->
      <div
        class="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#1A2238]"
        style="padding-top: max(12px, env(safe-area-inset-top))"
      >
        <!-- Left: hamburger / layers icon -->
        <button type="button" class="w-9 h-9 flex items-center justify-center rounded-xl bg-[#13192B] border border-[#222B45] active:scale-95 transition-transform cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#8E9AB0" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Center: XP + Hearts -->
        <div class="flex items-center gap-3">
          <!-- XP -->
          <div class="flex items-center gap-1.5 bg-[#13192B] border border-[#222B45] rounded-full px-3 py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F7DF1E">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
            </svg>
            <span class="text-[13px] font-bold text-white">{{ xp }} XP</span>
          </div>
          <!-- Hearts -->
          <div class="flex items-center gap-1.5 bg-[#13192B] border border-[#222B45] rounded-full px-3 py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF2B51">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span class="text-[13px] font-bold text-white">{{ hearts }}</span>
          </div>
        </div>

        <!-- Right: Mascot avatar -->
        <div class="w-9 h-9 rounded-full border-2 border-[#FF2B51] overflow-hidden bg-[#0B0F19] flex items-center justify-center">
          <MascotAvatar variant="idol" size="sm" class="scale-110" />
        </div>
      </div>

      <!-- ── TRACK SELECTOR ─────────────────────────────────────────────── -->
      <div class="shrink-0 px-4 py-2 relative z-20">
        <button
          @click="showTrackMenu = !showTrackMenu"
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-full border border-[#222B45] bg-[#13192B] active:scale-[0.98] transition-transform cursor-pointer"
        >
          <span class="text-[13px] font-semibold text-white">
            Jalur Aktif: {{ activeTrack.title }}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="transition-transform" :class="showTrackMenu ? 'rotate-180' : ''">
            <path d="M6 9l6 6 6-6" stroke="#8E9AB0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Dropdown -->
        <Transition name="slide-left">
          <div
            v-if="showTrackMenu"
            class="absolute left-4 right-4 top-full mt-1 bg-[#13192B] border border-[#222B45] rounded-xl overflow-hidden shadow-xl z-30"
          >
            <button
              v-for="track in allTracks"
              :key="track.id"
              @click="switchTrack(track.id)"
              type="button"
              class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1A2238] transition-colors cursor-pointer"
              :class="track.id === activeTrackId ? 'bg-[rgba(255,43,81,0.08)]' : ''"
            >
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0"
                :style="{ backgroundColor: track.accentColor, color: track.badgeTextColor || '#fff' }"
              >{{ track.badgeLabel }}</div>
              <span class="text-[13px] font-medium" :class="track.id === activeTrackId ? 'text-[#FF2B51]' : 'text-white'">
                {{ track.title }}
              </span>
              <svg v-if="track.id === activeTrackId" class="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#FF2B51" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </Transition>
      </div>

      <!-- ── WORLD MAP (vertical zigzag) ──────────────────────────────────── -->
      <div class="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-4" @click="showTrackMenu = false">

        <div class="flex flex-col gap-0 relative min-h-full">

          <!-- Boss Gate Node (always at top) -->
          <div class="flex flex-col items-center mb-6" :class="positionClasses[0]">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all"
              :class="bossUnlocked
                ? 'bg-gradient-to-br from-[#F7DF1E] to-[#F97316] border-[#F7DF1E] shadow-[0_0_20px_rgba(247,223,30,0.4)]'
                : 'bg-[#13192B] border-[#222B45]'"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 16L3 7l5 3 4-6 4 6 5-3-2 9H5z"
                  :fill="bossUnlocked ? '#1A1A1A' : '#8E9AB0'"
                  :stroke="bossUnlocked ? '#1A1A1A' : '#8E9AB0'"
                  stroke-width="1" stroke-linejoin="round"/>
                <rect x="5" y="16" width="14" height="2" rx="1"
                  :fill="bossUnlocked ? '#1A1A1A' : '#8E9AB0'"/>
              </svg>
            </div>
            <div class="mt-2 text-center">
              <span class="text-[12px] font-bold" :class="bossUnlocked ? 'text-[#F7DF1E]' : 'text-[#8E9AB0]'">
                Boss Gate
              </span>
              <div class="text-[10px] text-[#8E9AB0]">Proyek Akhir</div>
            </div>
          </div>

          <!-- Dashed connector from Boss to Level 5 -->
          <div class="w-px h-10 border-l-2 border-dashed border-[#2A3450] self-center mb-2" />

          <!-- Level Nodes (top-to-bottom in display = Level 5 to Level 1) -->
          <template v-for="(level, idx) in levelsDisplayed" :key="level.id">

            <div class="flex flex-col mb-1" :class="positionClasses[idx + 1]">

              <!-- Level Node Button -->
              <div class="relative flex flex-col items-center">

                <!-- MULAI badge + mascot (only for active level) -->
                <div v-if="level.isActive" class="flex items-center gap-1 mb-1 self-start -ml-1">
                  <div class="w-5 h-5 rounded-full border-2 border-[#FF2B51] overflow-hidden bg-[#0B0F19] flex items-center justify-center">
                    <MascotAvatar variant="idol" size="sm" class="scale-150" />
                  </div>
                  <span class="text-[11px] font-extrabold text-[#FF2B51] tracking-wider uppercase bg-[rgba(255,43,81,0.15)] px-2 py-0.5 rounded-full border border-[#FF2B51]">
                    MULAI
                  </span>
                </div>

                <!-- The Level Circle/Square node -->
                <button
                  type="button"
                  :disabled="level.isLocked"
                  class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
                  :class="[
                    level.isCompleted ? 'bg-[#22C55E] border-2 border-[#22C55E] shadow-[0_0_16px_rgba(34,197,94,0.4)] cursor-pointer active:scale-95'
                    : level.isActive ? 'bg-[#FF2B51] border-2 border-[#FF2B51] shadow-[0_0_20px_rgba(255,43,81,0.5)] cursor-pointer active:scale-95'
                    : 'bg-[#13192B] border-2 border-[#1A2238] opacity-70 cursor-not-allowed'
                  ]"
                >
                  <!-- Completed: checkmark -->
                  <svg v-if="level.isCompleted" width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <!-- Active: play icon -->
                  <svg v-else-if="level.isActive" width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <polygon points="5,3 19,12 5,21" fill="white"/>
                  </svg>
                  <!-- Locked: padlock -->
                  <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="#4A5568" stroke-width="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4A5568" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>

              <!-- Level label below node -->
              <div class="mt-1.5 text-center max-w-[130px]">
                <div
                  class="text-[12px] font-bold px-2 py-0.5 rounded-full inline-block"
                  :class="level.isActive
                    ? 'text-white bg-[#13192B] border border-[#222B45]'
                    : level.isCompleted
                      ? 'text-[#22C55E]'
                      : 'text-[#8E9AB0]'"
                >
                  Level {{ level.num }} • {{ level.title }}
                </div>
              </div>
            </div>

            <!-- Dashed connector between levels -->
            <div
              v-if="idx < levelsDisplayed.length - 1"
              class="w-px h-10 border-l-2 border-dashed border-[#2A3450] mb-1"
              :class="[
                (idx % 2 === 0) ? 'self-start ml-24' : 'self-end mr-24'
              ]"
            />

          </template>

        </div>
      </div>

      <!-- ── TIPS CARD ──────────────────────────────────────────────────── -->
      <Transition name="slide-right">
        <div
          v-if="showTip"
          class="shrink-0 mx-4 mb-2 card-base p-3 flex items-start gap-2.5 border-[#FF2B51]/30 bg-[rgba(255,43,81,0.05)]"
        >
          <div class="w-8 h-8 rounded-full border border-[#FF2B51] overflow-hidden bg-[#0B0F19] flex items-center justify-center shrink-0">
            <MascotAvatar variant="idol" size="sm" class="scale-125" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[11px] font-bold text-[#FF2B51] uppercase tracking-wider mb-0.5">
              Tips L3-Bot • Kode Bersih
            </div>
            <p class="text-[12px] text-[#8E9AB0] leading-snug line-clamp-3">{{ tipMessage }}</p>
          </div>
          <button
            @click="showTip = false"
            type="button"
            class="w-6 h-6 flex items-center justify-center rounded-full bg-[#1A2238] text-[#8E9AB0] hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </Transition>

    </div>
  </AppShellLayout>
</template>
