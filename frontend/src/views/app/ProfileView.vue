<script setup>
/**
 * ProfileView - Tab "Profil" (/profile)
 * Menampilkan: avatar maskot, nickname, statistik petualangan,
 * jalur utama, pencapaian, dan tombol Reset Semua Progres.
 * Menyelaraskan 100% dengan referensi visual Android.
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShellLayout from '@/layouts/AppShellLayout.vue'
import L3MascotAnimated from '@/components/mascot/L3MascotAnimated.vue'
import { gameStore } from '@/stores/gameStore.js'
import { UserProfile } from '@/core/models/UserProfile.js'
import { onboardingStore } from '@/stores/onboardingStore.js'

const router = useRouter()

onMounted(() => {
  gameStore.refresh()
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
            type="button"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-[#13192B] border border-[#222B45] active:scale-95 transition-transform cursor-pointer"
            aria-label="Pengaturan"
            title="Pengaturan Akun"
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
            <!-- Mode Tampil -->
            <div v-if="!isEditing">
              <h2 class="text-[20px] font-extrabold text-white truncate">
                {{ profile?.nickname || 'Fall_Adventurer' }}
              </h2>
              <p class="text-[12px] text-[#8E9AB0] mt-0.5">
                {{ userTitle }} • Bergabung {{ joinDate }}
              </p>
              <button
                @click="startEdit"
                type="button"
                class="mt-2 px-3 py-1 rounded-full bg-[#1A2238] border border-[#222B45] text-[12px] font-semibold text-[#8E9AB0] hover:text-white hover:border-[#FF2B51] transition-colors cursor-pointer active:scale-95"
              >
                Ubah Nama
              </button>
            </div>

            <!-- Mode Edit Inline -->
            <div v-else class="flex flex-col gap-2">
              <input
                v-model="editName"
                type="text"
                maxlength="20"
                autofocus
                class="w-full px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#FF2B51] text-white text-[14px] font-bold outline-none"
                autocomplete="off"
                autocorrect="off"
                spellcheck="false"
              />
              <div class="flex gap-2">
                <button
                  @click="saveNickname"
                  type="button"
                  class="flex-1 py-1 rounded-lg bg-[#FF2B51] text-white text-[12px] font-bold cursor-pointer active:scale-95 transition-transform"
                >
                  Simpan
                </button>
                <button
                  @click="isEditing = false"
                  type="button"
                  class="flex-1 py-1 rounded-lg bg-[#1A2238] text-[#8E9AB0] text-[12px] font-bold cursor-pointer active:scale-95 transition-transform"
                >
                  Batal
                </button>
              </div>
            </div>
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

        <!-- ── PENCAPAIAN TERBARU (Medal Hijau Sesuai UI) ──────────────── -->
        <div class="flex flex-col gap-2.5">
          <span class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
            Pencapaian Terbaru
          </span>

          <div class="card-base p-4 flex items-center gap-3">
            <!-- Badge Icon Hijau -->
            <div class="w-12 h-12 rounded-full bg-[rgba(34,197,94,0.12)] border-2 border-[#22C55E] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="6" stroke="#22C55E" stroke-width="2"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <!-- Achievement Details -->
            <div class="flex-1 min-w-0">
              <div class="text-[14px] font-bold text-white">
                {{ levelsCompleted > 0 ? 'First Forger' : 'Petualang Baru' }}
              </div>
              <div class="text-[12px] text-[#8E9AB0] leading-snug mt-0.5">
                {{ levelsCompleted > 0
                  ? 'Selesaikan tantangan pertama di Cyber Foundry'
                  : 'Bergabung di ZenoQuest dan mulai petualangan codingmu!' }}
              </div>
            </div>
            <!-- Status Badge -->
            <div
              class="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
              :class="levelsCompleted > 0
                ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E] border border-[#22C55E]'
                : 'border border-[#222B45] text-[#8E9AB0] bg-[#161D31]'"
            >
              {{ levelsCompleted > 0 ? 'TERBUKA' : 'TERKUNCI' }}
            </div>
          </div>
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

    <!-- ── RESET CONFIRM MODAL ─────────────────────────────────────────── -->
    <Transition name="slide-left">
      <div
        v-if="showResetConfirm"
        class="absolute inset-0 bg-black/80 flex items-end justify-center z-50 pb-8 px-5"
        @click.self="showResetConfirm = false"
      >
        <div class="card-base w-full max-w-sm p-5 flex flex-col gap-4 border-[#222B45] bg-[#13192B] shadow-2xl">
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
