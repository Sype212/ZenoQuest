<script setup>
/**
 * ProfileView - Tab "Profil" (/profile)
 * Menampilkan: avatar maskot, nickname, statistik petualangan,
 * jalur utama, pencapaian, dan tombol Reset Semua Progres.
 * Menyelaraskan 100% dengan referensi visual Android.
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShellLayout from '@/layouts/AppShellLayout.vue'
import L3MascotAnimated from '@/components/mascot/L3MascotAnimated.vue'
import AchievementBadgeIcon from '@/components/common/AchievementBadgeIcon.vue'
import { gameStore } from '@/stores/gameStore.js'
import { getAchievementsWithStatus } from '@/core/services/achievementEngine.js'
import { UserProfile } from '@/core/models/UserProfile.js'
import { CourseTrack } from '@/core/models/CourseTrack.js'
import { onboardingStore } from '@/stores/onboardingStore.js'

const route  = useRoute()
const router = useRouter()
const achievementsSectionRef = ref(null)

async function scrollToAchievementsIfRequested() {
  if (route.query.focus === 'achievements') {
    await nextTick()
    achievementsSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(async () => {
  gameStore.refresh()
  await scrollToAchievementsIfRequested()
})

watch(() => route.query.focus, () => {
  scrollToAchievementsIfRequested()
})

// ─── Load Reaktif Data ────────────────────────────────────────────────────────
const profile     = computed(() =>
  gameStore.state.profile ? UserProfile.fromJSON(gameStore.state.profile) : null
)
const stats       = computed(() => gameStore.state.stats)
const progressMap = computed(() => gameStore.state.progress || {})

// ─── Stats computed ───────────────────────────────────────────────────────────
const totalXp = computed(() => stats.value?.xp ?? 0)

const levelsCompleted = computed(() => {
  let count = 0
  Object.values(progressMap.value).forEach(trackProgress => {
    Object.values(trackProgress || {}).forEach(status => {
      if (status === 'completed') count++
    })
  })
  return count
})

// Perfect run count: akurat dari zq_stats.perfectRunLevels
const perfectRuns = computed(() => {
  return stats.value?.perfectRunLevels?.length ?? 0
})

// ─── Pencapaian (Achievements Grid) ──────────────────────────────────────────
const achievements = computed(() =>
  getAchievementsWithStatus(gameStore.state.achievements)
)
const unlockedAchievementCount = computed(() =>
  achievements.value.filter((a) => a.unlocked).length
)
const achievementProgressPct = computed(() => {
  if (!achievements.value.length) return 0
  return Math.round((unlockedAchievementCount.value / achievements.value.length) * 100)
})
const achievementFilter = ref('all') // 'all' | 'unlocked' | 'locked'
const filteredAchievements = computed(() => {
  if (achievementFilter.value === 'unlocked') {
    return achievements.value.filter((a) => a.unlocked)
  }
  if (achievementFilter.value === 'locked') {
    return achievements.value.filter((a) => !a.unlocked)
  }
  return achievements.value
})

// ─── User title by XP ─────────────────────────────────────────────────────────
const userTitle = computed(() => {
  const xp = totalXp.value
  if (xp >= 500) return 'Master Coder'
  if (xp >= 300) return 'Level 3 Explorer'
  if (xp >= 150) return 'Level 2 Explorer'
  return 'Level 1 Explorer'
})

// ─── Join date from profile ───────────────────────────────────────────────────
const joinDate = computed(() => {
  if (!profile.value?.createdAt) return 'Nov 2026'
  const d = new Date(profile.value.createdAt)
  return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
})

// ─── Track short name (sesuai referensi UI: Web Dev, C#, Kotlin, dll) ────────
const trackShortName = computed(() => {
  const map = {
    html:   'HTML',
    css:    'CSS',
    js:     'JavaScript',
    csharp: 'C#',
    kotlin: 'Kotlin',
  }
  return map[profile.value?.selectedTrack] || 'HTML'
})

// ─── Edit Nickname (Inline) ───────────────────────────────────────────────────
const isEditing = ref(false)
const editName  = ref('')

function startEdit() {
  editName.value = profile.value?.nickname || ''
  isEditing.value = true
}

function saveNickname() {
  const name = editName.value.trim()
  if (name.length < 3 || name.length > 20) return
  gameStore.updateProfile({ nickname: name })
  isEditing.value = false
}

// ─── Settings Modal (Target Harian, Pengalaman & Jalur Utama) ─────────────────
const allTracks = CourseTrack.getAll()
const DAILY_TARGET_OPTIONS = [5, 10, 15, 20]
const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'Pemula Nol' },
  { id: 'intermediate', label: 'Pernah Koding' },
]

const showSettingsModal  = ref(false)
const draftTargetMinutes = ref(10)
const draftExperience    = ref('beginner')
const draftSelectedTrack = ref('html')

const experienceLabel = computed(() =>
  profile.value?.experienceLevel === 'intermediate' ? 'Pernah Koding' : 'Pemula Nol'
)

function openSettings() {
  draftTargetMinutes.value = profile.value?.dailyTargetMinutes || 10
  draftExperience.value = profile.value?.experienceLevel || 'beginner'
  draftSelectedTrack.value = profile.value?.selectedTrack || 'html'
  showSettingsModal.value = true
}

function saveSettings() {
  gameStore.updateProfile({
    dailyTargetMinutes: draftTargetMinutes.value,
    experienceLevel: draftExperience.value,
    selectedTrack: draftSelectedTrack.value,
  })
  showSettingsModal.value = false
}

// ─── Reset Progress Modal ─────────────────────────────────────────────────────
const showResetConfirm = ref(false)

function confirmReset() {
  showResetConfirm.value = true
}

function executeReset() {
  gameStore.resetAll()
  onboardingStore.reset()
  router.replace('/onboarding')
}
</script>

<template>
  <AppShellLayout>
    <div class="flex flex-col h-full bg-[#0B0F19] overflow-y-auto scrollbar-hide relative">

      <!-- ── HEADER ─────────────────────────────────────────────────────── -->
      <div
        class="shrink-0 flex items-center justify-between px-5 pb-3 pt-4 border-b border-[#1A2238]"
        style="padding-top: max(16px, env(safe-area-inset-top))"
      >
        <div class="w-9" />
        <h1 class="text-[14px] font-extrabold text-white uppercase tracking-widest text-center leading-tight">
          PROFIL<br/>PENGGUNA
        </h1>
        <div class="w-9 flex justify-end">
          <button
            @click="openSettings"
            type="button"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-[#13192B] border border-[#222B45] hover:border-[#FF2B51] active:scale-95 transition-all cursor-pointer"
            aria-label="Pengaturan"
            title="Pengaturan Belajar"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" stroke="#8E9AB0" stroke-width="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#8E9AB0" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-5 px-5 py-4 pb-6">

        <!-- ── USER CARD (Frame Avatar Rounded-Square Merah Neon) ──────── -->
        <div class="card-base p-4 flex items-center gap-4">
          <!-- Mascot avatar (kotak rounded-2xl dengan border merah neon menyala sesuai referensi UI) -->
          <div class="w-16 h-16 rounded-2xl border-2 border-[#FF2B51] shadow-[0_0_14px_rgba(255,43,81,0.45)] bg-[#0B0F19] flex items-center justify-center shrink-0 overflow-hidden p-1.5">
            <L3MascotAnimated variant="idle" class="w-full h-full" />
          </div>

          <!-- Info & Nama -->
          <div class="flex-1 min-w-0">
            <Transition name="ios-fade" mode="out-in">
              <!-- Mode Tampil -->
              <div v-if="!isEditing" key="display">
                <h2 class="text-[20px] font-extrabold text-white truncate">
                  {{ profile?.nickname || 'Fall_Adventurer' }}
                </h2>
                <p class="text-[12px] text-[#8E9AB0] mt-0.5">
                  {{ userTitle }} • Bergabung {{ joinDate }}
                </p>
                <p class="text-[11px] text-[#CBD5E1] mt-1">
                  Target <span class="text-white font-semibold">{{ profile?.dailyTargetMinutes || 10 }} mnt/hari</span>
                  • Level <span class="text-white font-semibold">{{ experienceLabel }}</span>
                </p>
                <button
                  @click="startEdit"
                  type="button"
                  class="ios-press mt-2 px-3 py-1 rounded-full bg-[#1A2238] border border-[#222B45] text-[12px] font-semibold text-[#8E9AB0] hover:text-white hover:border-[#FF2B51] cursor-pointer"
                >
                  Ubah Nama
                </button>
              </div>

              <!-- Mode Edit Inline -->
              <div v-else key="edit" class="flex flex-col gap-2">
                <input
                  v-model="editName"
                  type="text"
                  maxlength="20"
                  autofocus
                  class="w-full px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#FF2B51] text-white text-[14px] font-bold outline-none transition-colors"
                  autocomplete="off"
                  autocorrect="off"
                  spellcheck="false"
                />
                <div class="flex gap-2">
                  <button
                    @click="saveNickname"
                    type="button"
                    class="ios-press flex-1 py-1 rounded-lg bg-[#FF2B51] text-white text-[12px] font-bold cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    @click="isEditing = false"
                    type="button"
                    class="ios-press flex-1 py-1 rounded-lg bg-[#1A2238] text-[#8E9AB0] text-[12px] font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- ── STATISTIK PETUALANGAN (Warna Sesuai Referensi UI) ────────── -->
        <div class="flex flex-col gap-2.5">
          <span class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
            Statistik Petualangan
          </span>

          <div class="grid grid-cols-2 gap-2.5">
            <!-- XP (Kuning Emas #F59E0B sesuai UI) -->
            <div class="card-base p-4 flex flex-col gap-1">
              <span class="text-[22px] font-extrabold text-[#F59E0B]">{{ totalXp }} XP</span>
              <span class="text-[12px] text-[#8E9AB0]">Total Akumulasi</span>
            </div>

            <!-- Level Ditamatkan (Hijau #22C55E sesuai UI) -->
            <div class="card-base p-4 flex flex-col gap-1">
              <span class="text-[22px] font-extrabold text-[#22C55E]">{{ levelsCompleted }} Level</span>
              <span class="text-[12px] text-[#8E9AB0]">Level Ditamatkan</span>
            </div>

            <!-- 5 Hati Utuh (Merah #FF2B51 sesuai UI) -->
            <div class="card-base p-4 flex flex-col gap-1">
              <span class="text-[22px] font-extrabold text-[#FF2B51]">{{ perfectRuns }} Kali</span>
              <span class="text-[12px] text-[#8E9AB0]">5 Hati Utuh</span>
            </div>

            <!-- Jalur Utama (Cyan/Sky #38BDF8 sesuai UI) -->
            <div class="card-base p-4 flex flex-col gap-1">
              <span class="text-[22px] font-extrabold text-[#38BDF8] leading-tight truncate">
                {{ trackShortName }}
              </span>
              <span class="text-[12px] text-[#8E9AB0]">Jalur Utama</span>
            </div>
          </div>
        </div>

        <!-- ── PENCAPAIAN (Grid 2 Kolom + Nama Locked Tetap Kelihatan) ─── -->
        <div
          ref="achievementsSectionRef"
          class="flex flex-col gap-2.5"
          data-testid="achievements-section"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
              Pencapaian
            </span>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[rgba(34,197,94,0.12)] text-[#22C55E] border border-[rgba(34,197,94,0.35)]"
              data-testid="achievements-counter"
            >
              {{ unlockedAchievementCount }} / {{ achievements.length }}
            </span>
          </div>

          <!-- Progress bar total pencapaian -->
          <div class="w-full h-1.5 bg-[#1A2238] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-[#22C55E] transition-all duration-500"
              :style="{ width: `${achievementProgressPct}%` }"
            />
          </div>

          <!-- Filter pills -->
          <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0E1322] border border-[#1A2238]">
            <button
              type="button"
              @click="achievementFilter = 'all'"
              class="py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              :class="achievementFilter === 'all'
                ? 'bg-[#1A2238] text-white'
                : 'text-[#8E9AB0] hover:text-white'"
            >
              Semua ({{ achievements.length }})
            </button>
            <button
              type="button"
              @click="achievementFilter = 'unlocked'"
              class="py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              :class="achievementFilter === 'unlocked'
                ? 'bg-[rgba(34,197,94,0.16)] text-[#22C55E]'
                : 'text-[#8E9AB0] hover:text-white'"
            >
              Terbuka ({{ unlockedAchievementCount }})
            </button>
            <button
              type="button"
              @click="achievementFilter = 'locked'"
              class="py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              :class="achievementFilter === 'locked'
                ? 'bg-[#1A2238] text-[#CBD5E1]'
                : 'text-[#8E9AB0] hover:text-white'"
            >
              Terkunci ({{ achievements.length - unlockedAchievementCount }})
            </button>
          </div>

          <!-- Filtered Achievement Grid / Empty State -->
          <Transition name="ios-fade" mode="out-in">
            <!-- Empty state for filtered view -->
            <div
              v-if="filteredAchievements.length === 0"
              :key="`empty-${achievementFilter}`"
              class="card-base p-4 text-center text-[12px] text-[#8E9AB0]"
            >
              {{ achievementFilter === 'unlocked'
                ? 'Belum ada pencapaian terbuka.'
                : 'Hebat! Semua pencapaian sudah terbuka!' }}
            </div>

            <!-- Grid 2 kolom -->
            <div
              v-else
              :key="`grid-${achievementFilter}`"
              class="grid grid-cols-2 gap-2.5"
              data-testid="achievements-grid"
            >
            <div
              v-for="ach in filteredAchievements"
              :key="ach.id"
              :data-achievement-id="ach.id"
              :data-unlocked="String(ach.unlocked)"
              class="rounded-xl border p-3 flex flex-col gap-2.5 transition-all"
              :class="ach.unlocked
                ? 'bg-[#13192B]'
                : 'bg-[#0F1422] border-[#1E2742] opacity-85'"
              :style="ach.unlocked
                ? {
                    borderColor: `${ach.accentColor}66`,
                    boxShadow: `0 0 14px ${ach.accentColor}1A`,
                  }
                : undefined"
            >
              <div class="flex items-start justify-between gap-2">
                <div
                  class="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                  :class="ach.unlocked ? '' : 'bg-[#161D31] border-[#222B45]'"
                  :style="ach.unlocked
                    ? {
                        borderColor: ach.accentColor,
                        backgroundColor: `${ach.accentColor}1F`,
                      }
                    : undefined"
                >
                  <AchievementBadgeIcon
                    :icon-key="ach.iconKey"
                    :badge-label="ach.badgeLabel || ''"
                    :color="ach.accentColor"
                    :unlocked="ach.unlocked"
                    :size="18"
                  />
                </div>

                <!-- Status indicator: checkmark if unlocked, lock icon if locked -->
                <span
                  v-if="ach.unlocked"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-[rgba(34,197,94,0.14)] text-[#22C55E] border border-[rgba(34,197,94,0.4)] shrink-0"
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  Terbuka
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-[#161D31] text-[#64748B] border border-[#222B45] shrink-0"
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="10" rx="2" stroke="#64748B" stroke-width="2.2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#64748B" stroke-width="2.2" stroke-linecap="round" />
                  </svg>
                  Terkunci
                </span>
              </div>

              <div class="min-w-0">
                <div
                  class="text-[13px] font-extrabold leading-snug break-words"
                  :class="ach.unlocked ? 'text-white' : 'text-[#CBD5E1]'"
                >
                  {{ ach.title }}
                </div>
                <p
                  class="text-[11px] leading-snug mt-0.5"
                  :class="ach.unlocked ? 'text-[#94A3B8]' : 'text-[#64748B]'"
                >
                  {{ ach.description }}
                </p>
              </div>
            </div>
            </div>
          </Transition>
        </div>

        <!-- ── PENYIMPANAN DATA LOKAL & RESET BUTTON ───────────────────── -->
        <div class="rounded-xl border border-[rgba(255,43,81,0.3)] bg-[rgba(255,43,81,0.05)] p-4 flex flex-col gap-3">
          <div class="text-[11px] font-bold text-[#FF2B51] uppercase tracking-widest">
            PENYIMPANAN DATA LOKAL
          </div>
          <p class="text-[12px] text-[#8E9AB0] leading-relaxed">
            Progres tersimpan pada penyimpanan perangkat (localStorage). Reset akan mengulang petualangan dari awal.
          </p>
          <button
            @click="confirmReset"
            type="button"
            class="w-full py-3.5 rounded-xl bg-[#FF2B51] hover:bg-[#ff3f62] text-white font-bold text-[13px] uppercase tracking-widest active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_16px_rgba(255,43,81,0.35)]"
          >
            RESET SEMUA PROGRES
          </button>
        </div>

      </div>
    </div>

    <!-- ── SETTINGS MODAL (iOS Bottom Sheet) ────────────────────────────── -->
    <Transition name="ios-sheet">
      <div
        v-if="showSettingsModal"
        class="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-end justify-center z-50 pb-6 px-4"
        @click.self="showSettingsModal = false"
      >
        <div class="ios-sheet-card card-base w-full max-w-sm p-5 flex flex-col gap-4 border-[#222B45] bg-[#13192B] shadow-2xl">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-[16px] font-extrabold text-white">Pengaturan Belajar</h2>
              <p class="text-[11.5px] text-[#8E9AB0]">Sesuaikan target, level, dan jalur utama.</p>
            </div>
            <button
              @click="showSettingsModal = false"
              type="button"
              aria-label="Tutup Pengaturan"
              class="w-8 h-8 rounded-lg bg-[#1A2238] border border-[#222B45] text-[#8E9AB0] hover:text-white flex items-center justify-center cursor-pointer"
            >
              ×
            </button>
          </div>

          <!-- Target Harian -->
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
              Target Harian
            </span>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="mins in DAILY_TARGET_OPTIONS"
                :key="mins"
                type="button"
                @click="draftTargetMinutes = mins"
                class="py-2 rounded-xl border text-[12px] font-bold transition-all cursor-pointer"
                :class="draftTargetMinutes === mins
                  ? 'border-[#FF2B51] bg-[rgba(255,43,81,0.16)] text-white'
                  : 'border-[#222B45] bg-[#0B0F19] text-[#8E9AB0] hover:text-white'"
              >
                {{ mins }} mnt
              </button>
            </div>
          </div>

          <!-- Level Pengalaman -->
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
              Level Pengalaman
            </span>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="exp in EXPERIENCE_OPTIONS"
                :key="exp.id"
                type="button"
                @click="draftExperience = exp.id"
                class="py-2 rounded-xl border text-[12px] font-bold transition-all cursor-pointer"
                :class="draftExperience === exp.id
                  ? 'border-[#FF2B51] bg-[rgba(255,43,81,0.16)] text-white'
                  : 'border-[#222B45] bg-[#0B0F19] text-[#8E9AB0] hover:text-white'"
              >
                {{ exp.label }}
              </button>
            </div>
          </div>

          <!-- Jalur Utama -->
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
              Jalur Utama
            </span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="track in allTracks"
                :key="track.id"
                type="button"
                @click="draftSelectedTrack = track.id"
                class="px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                :class="draftSelectedTrack === track.id
                  ? 'border-[#FF2B51] bg-[rgba(255,43,81,0.16)] text-white'
                  : 'border-[#222B45] bg-[#0B0F19] text-[#8E9AB0] hover:text-white'"
              >
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  :style="{ backgroundColor: track.accentColor }"
                />
                {{ track.title }}
              </button>
            </div>
          </div>

          <div class="flex gap-2.5 pt-1">
            <button
              @click="showSettingsModal = false"
              type="button"
              class="flex-1 py-2.5 rounded-xl bg-[#1A2238] border border-[#222B45] text-[#8E9AB0] font-bold text-[13px] cursor-pointer active:scale-95 transition-transform"
            >
              Batal
            </button>
            <button
              @click="saveSettings"
              type="button"
              class="flex-1 py-2.5 rounded-xl bg-[#FF2B51] hover:bg-[#ff3f62] text-white font-bold text-[13px] cursor-pointer active:scale-95 transition-transform shadow-[0_0_12px_rgba(255,43,81,0.35)]"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── RESET CONFIRM MODAL (iOS Bottom Sheet) ───────────────────────── -->
    <Transition name="ios-sheet">
      <div
        v-if="showResetConfirm"
        class="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-end justify-center z-50 pb-8 px-5"
        @click.self="showResetConfirm = false"
      >
        <div class="ios-sheet-card card-base w-full max-w-sm p-5 flex flex-col gap-4 border-[#222B45] bg-[#13192B] shadow-2xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[rgba(255,43,81,0.15)] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#FF2B51" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <div class="text-[15px] font-bold text-white">Reset Semua Progres?</div>
              <div class="text-[12px] text-[#8E9AB0]">Tindakan ini tidak bisa dibatalkan.</div>
            </div>
          </div>
          <p class="text-[12px] text-[#8E9AB0] leading-relaxed">
            Seluruh data XP, level tamat, dan sesi aktif akan dihapus dari penyimpanan lokal browser. Kamu akan diarahkan ulang ke onboarding.
          </p>
          <div class="flex gap-2.5">
            <button
              @click="showResetConfirm = false"
              type="button"
              class="flex-1 py-3 rounded-xl bg-[#1A2238] hover:bg-[#222B45] border border-[#222B45] text-[#8E9AB0] font-bold text-[13px] cursor-pointer active:scale-95 transition-transform"
            >
              Batal
            </button>
            <button
              @click="executeReset"
              type="button"
              class="flex-1 py-3 rounded-xl bg-[#FF2B51] hover:bg-[#ff3f62] text-white font-bold text-[13px] cursor-pointer active:scale-95 transition-transform shadow-[0_0_12px_rgba(255,43,81,0.4)]"
            >
              Ya, Reset
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </AppShellLayout>
</template>
