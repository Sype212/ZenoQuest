<script setup>
/**
 * WorldMapView - Tab "Peta" (/map/:trackId)
 * Peta level vertikal dengan zigzag layout.
 * - Menyesuaikan level dan konten sesuai kurikulum yang dipilih user
 * - Interaktif: Tapping level menampilkan pratinjau detail node kurikulum
 * - Top HUD: Navigasi cepat ke Materi (Layers icon) dan Profil (Avatar)
 */
import { ref, computed, watch } from 'vue'
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

// ─── Active Track & Reactivity ────────────────────────────────────────────────
const activeTrackId = ref(route.params.trackId && route.params.trackId !== 'active'
  ? route.params.trackId
  : (profile?.selectedTrack || 'html'))

// Sinkronisasi jika parameter rute berubah
watch(() => route.params.trackId, (newId) => {
  if (newId && newId !== 'active' && newId !== activeTrackId.value) {
    activeTrackId.value = newId
  }
})

const allTracks   = CourseTrack.getAll()
const activeTrack = computed(() => CourseTrack.findById(activeTrackId.value) || allTracks[0])

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

// Reverse levels for bottom-to-top display (Level 5 di atas, Level 1 di bawah)
const levelsDisplayed = computed(() => [...levels.value].reverse())

// Boss gate = unlocked if all 5 levels are completed
const bossUnlocked = computed(() => levels.value.every(l => l.isCompleted))

// ─── Level Modal Selection ─────────────────────────────────────────────────────
const selectedLevelModal = ref(null)

function onSelectLevel(level) {
  selectedLevelModal.value = level
}

function onSelectBossGate() {
  selectedLevelModal.value = {
    num: 'BOSS',
    title: 'Boss Gate • Proyek Akhir',
    topic: 'Tantangan integrasi puncak! Menguji seluruh pemahaman logika dan sintaks dari 5 level sebelumnya.',
    isCompleted: false,
    isActive: bossUnlocked.value,
    isLocked: !bossUnlocked.value,
  }
}

// ─── Zigzag positions matching reference UI ───────────────────────────────────
const positionClasses = [
  'self-end mr-10',       // Boss Gate (top right)
  'self-start ml-12',     // Level 5 (top left)
  'self-end mr-12',       // Level 4 (mid-top right)
  'self-start ml-12',     // Level 3 (mid-left)
  'self-end mr-12',       // Level 2 (mid-right)
  'self-center',          // Level 1 (bottom center)
]

// ─── Tips Card ────────────────────────────────────────────────────────────────
const showTip = ref(true)
const tipMessage = computed(() => {
  const track = activeTrackId.value
  const tips = {
    html:   'Gunakan tag <main> untuk membungkus konten inti agar struktur halamanmu ramah SEO dan rapi!',
    css:    'Gunakan CSS Custom Properties (variabel) untuk warna & ukuran agar kode lebih mudah diubah!',
    js:     'Gunakan const untuk nilai yang tidak berubah, baru let untuk yang bisa berubah!',
    csharp: 'Biasakan menulis komentar // pada setiap blok kode agar lebih mudah dibaca tim!',
    kotlin: 'Kotlin null-safety menjaga aplikasimu dari crash: gunakan ?. untuk akses aman!',
  }
  return tips[track] || tips.html
})
</script>

<template>
  <AppShellLayout>
    <div class="flex flex-col h-full bg-[#0B0F19] overflow-hidden relative">

      <!-- ── TOP HUD (persis sesuai referensi UI) ────────────────────────── -->
      <div
        class="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#1A2238]"
        style="padding-top: max(12px, env(safe-area-inset-top))"
      >
        <!-- Left: Stack / Layers icon (Akses Cepat ke Materi) -->
        <button
          @click="router.push('/courses')"
          type="button"
          class="w-9 h-9 flex items-center justify-center rounded-xl bg-[#13192B] border border-[#222B45] active:scale-95 transition-transform cursor-pointer"
          aria-label="Pilih Materi"
          title="Buka Daftar Materi"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#8E9AB0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Center: XP + Hearts Badge Container -->
        <div class="flex items-center gap-2">
          <!-- XP Capsule -->
          <div class="flex items-center gap-1.5 bg-[#13192B] border border-[#222B45] rounded-full px-3 py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F7DF1E">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
            </svg>
            <span class="text-[13px] font-bold text-[#F7DF1E]">{{ xp }} XP</span>
          </div>
          <!-- Hearts Capsule -->
          <div class="flex items-center gap-1.5 bg-[#13192B] border border-[#222B45] rounded-full px-3 py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF2B51">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span class="text-[13px] font-bold text-[#FF2B51]">{{ hearts }}</span>
          </div>
        </div>

        <!-- Right: Mascot avatar button (Akses Cepat ke Profil) -->
        <button
          @click="router.push('/profile')"
          type="button"
          class="cursor-pointer active:scale-95 transition-transform"
          aria-label="Buka Profil Pengguna"
          title="Buka Profil"
        >
          <MascotAvatar variant="idle" size="xs" />
        </button>
      </div>

      <!-- ── TRACK SELECTOR DROPDOWN ────────────────────────────────────── -->
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

        <!-- Dropdown Menu -->
        <Transition name="slide-left">
          <div
            v-if="showTrackMenu"
            class="absolute left-4 right-4 top-full mt-1 bg-[#13192B] border border-[#222B45] rounded-xl overflow-hidden shadow-2xl z-30"
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

        <div class="flex flex-col gap-0 relative min-h-full pb-4">

          <!-- Boss Gate Node (Atas Kanan) -->
          <div class="flex flex-col items-center mb-4" :class="positionClasses[0]">
            <button
              @click="onSelectBossGate"
              type="button"
              class="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer active:scale-95"
              :class="bossUnlocked
                ? 'bg-gradient-to-br from-[#F7DF1E] to-[#F97316] border-[#F7DF1E] shadow-[0_0_20px_rgba(247,223,30,0.4)]'
                : 'bg-[#13192B] border-[#222B45]'"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 16L3 7l5 3 4-6 4 6 5-3-2 9H5z"
                  :fill="bossUnlocked ? '#1A1A1A' : '#F59E0B'"
                  :stroke="bossUnlocked ? '#1A1A1A' : '#F59E0B'"
                  stroke-width="1.2" stroke-linejoin="round"/>
                <rect x="5" y="16" width="14" height="2" rx="1"
                  :fill="bossUnlocked ? '#1A1A1A' : '#F59E0B'"/>
              </svg>
            </button>
            <div class="mt-1.5 text-center">
              <span class="text-[12px] font-bold" :class="bossUnlocked ? 'text-[#F7DF1E]' : 'text-[#8E9AB0]'">
                Boss Gate • Proyek Akhir
              </span>
            </div>
          </div>

          <!-- Dashed connector to Level 5 -->
          <div class="w-px h-8 border-l-2 border-dashed border-[#2A3450] self-end mr-20 mb-1" />

          <!-- Level Nodes (Tampil dari atas ke bawah: Level 5 -> 1) -->
          <template v-for="(level, idx) in levelsDisplayed" :key="level.id">

            <div class="flex flex-col mb-1" :class="positionClasses[idx + 1]">

              <!-- Node Wrapper -->
              <div class="relative flex flex-col items-center">

                <!-- Mascot & MULAI Badge (Hanya pada level aktif) -->
                <div v-if="level.isActive" class="flex items-center gap-1 mb-1 self-start -ml-2">
                  <MascotAvatar variant="idle" size="2xs" />
                  <span class="text-[11px] font-extrabold text-[#FF2B51] tracking-wider uppercase bg-[rgba(255,43,81,0.18)] px-2 py-0.5 rounded-full border border-[#FF2B51] shadow-[0_0_8px_rgba(255,43,81,0.4)]">
                    MULAI
                  </span>
                </div>

                <!-- Level Node Button -->
                <button
                  type="button"
                  @click="onSelectLevel(level)"
                  class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  :class="[
                    level.isCompleted
                      ? 'bg-[#22C55E] border-2 border-[#22C55E] shadow-[0_0_16px_rgba(34,197,94,0.4)]'
                      : level.isActive
                        ? 'bg-[#FF2B51] border-2 border-[#FF2B51] shadow-[0_0_20px_rgba(255,43,81,0.5)]'
                        : 'bg-[#13192B] border-2 border-[#1A2238] opacity-75'
                  ]"
                >
                  <!-- Completed: Checkmark -->
                  <svg v-if="level.isCompleted" width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <!-- Active: Play icon -->
                  <svg v-else-if="level.isActive" width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <polygon points="5,3 19,12 5,21" fill="white"/>
                  </svg>
                  <!-- Locked: Padlock -->
                  <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="#4A5568" stroke-width="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4A5568" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>

              <!-- Level Title Pill -->
              <div class="mt-1.5 text-center max-w-[150px]">
                <div
                  class="text-[12px] font-bold px-2.5 py-0.5 rounded-full inline-block"
                  :class="level.isActive
                    ? 'text-white bg-[#13192B] border border-[#222B45] shadow-sm'
                    : level.isCompleted
                      ? 'text-[#22C55E]'
                      : 'text-[#8E9AB0]'"
                >
                  Level {{ level.num }} • {{ level.title }}
                </div>
              </div>
            </div>

            <!-- Floating stepping-stone oval decoration (between level 3 and 2) -->
            <div
              v-if="idx === 2"
              class="w-10 h-16 rounded-full bg-[#13192B] border border-[#222B45]/70 self-center my-1 opacity-70 shadow-inner"
              title="Stepping stone biome"
            />

            <!-- Dashed Path Connector -->
            <div
              v-if="idx < levelsDisplayed.length - 1"
              class="w-px h-8 border-l-2 border-dashed border-[#2A3450] mb-1"
              :class="[
                (idx % 2 === 0) ? 'self-start ml-24' : 'self-end mr-24'
              ]"
            />

          </template>

        </div>
      </div>

      <!-- ── TIPS CARD (Tips L3-Bot) ────────────────────────────────────── -->
      <Transition name="slide-right">
        <div
          v-if="showTip"
          class="shrink-0 mx-4 mb-2 card-base p-3 flex items-start gap-2.5 border-[#FF2B51]/30 bg-[rgba(255,43,81,0.06)]"
        >
          <MascotAvatar variant="hi" size="xs" />
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
            aria-label="Tutup Tips"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </Transition>

      <!-- ── LEVEL DETAIL MODAL (Saat mengetuk level) ────────────────────── -->
      <Transition name="slide-left">
        <div
          v-if="selectedLevelModal"
          class="absolute inset-0 bg-black/75 flex items-end justify-center z-50 pb-6 px-4"
          @click.self="selectedLevelModal = null"
        >
          <div class="card-base w-full max-w-sm p-5 flex flex-col gap-4 border-[#222B45] bg-[#13192B] shadow-2xl">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-[15px] shrink-0"
                  :class="selectedLevelModal.isCompleted
                    ? 'bg-[#22C55E] text-white'
                    : selectedLevelModal.isActive
                      ? 'bg-[#FF2B51] text-white shadow-[0_0_12px_rgba(255,43,81,0.5)]'
                      : 'bg-[#1A2238] text-[#8E9AB0]'"
                >
                  {{ typeof selectedLevelModal.num === 'number' ? `L${selectedLevelModal.num}` : '👑' }}
                </div>
                <div>
                  <div class="text-[11px] font-bold uppercase tracking-wider" :class="selectedLevelModal.isActive ? 'text-[#FF2B51]' : selectedLevelModal.isCompleted ? 'text-[#22C55E]' : 'text-[#8E9AB0]'">
                    {{ selectedLevelModal.isCompleted ? '✓ Level Selesai' : selectedLevelModal.isActive ? '▶ Level Aktif' : '🔒 Terkunci' }}
                  </div>
                  <h3 class="text-[16px] font-bold text-white leading-tight mt-0.5">
                    {{ selectedLevelModal.title }}
                  </h3>
                </div>
              </div>
              <button
                @click="selectedLevelModal = null"
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-full bg-[#1A2238] text-[#8E9AB0] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p class="text-[13px] text-[#8E9AB0] leading-relaxed">
              {{ selectedLevelModal.topic || 'Materi teori dan latihan interaktif terpadu.' }}
            </p>

            <div class="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-[#0B0F19] border border-[#1A2238] text-center text-xs">
              <div>
                <span class="text-[#8E9AB0] block text-[10px]">Struktur</span>
                <span class="font-bold text-white">10 Node</span>
              </div>
              <div>
                <span class="text-[#8E9AB0] block text-[10px]">Hadiah</span>
                <span class="font-bold text-[#F7DF1E]">+100 XP</span>
              </div>
              <div>
                <span class="text-[#8E9AB0] block text-[10px]">Nyawa</span>
                <span class="font-bold text-[#FF2B51]">5 Hati</span>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-[rgba(255,43,81,0.08)] border border-[rgba(255,43,81,0.2)] text-[12px] text-[#8E9AB0] flex items-center gap-2.5">
              <span class="text-base shrink-0">🎨</span>
              <span>Desain UI Arena Soal sedang dikembangkan. Kamu sudah dapat meninjau peta dan kurikulum!</span>
            </div>

            <button
              @click="selectedLevelModal = null"
              type="button"
              class="w-full py-3 rounded-xl bg-[#1A2238] hover:bg-[#222B45] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </AppShellLayout>
</template>
