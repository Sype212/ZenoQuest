<script setup>
/**
 * QuizArenaView - /quiz/:levelId
 * Full-screen 4-zone interactive learning arena matching ZenoQuest design mockups
 * and PRD v1.6 (§5.2, §5.3, §5.5, F-04..F-10):
 *  - Zona 1: Top HUD (Exit, 10-segment progress bar, XP, 5 Hearts)
 *  - Zona 2: Mascot state card (SIAGA/MANTAP/SEMANGAT) + Question/Dialogue bubble
 *  - Zona 3: Theory card + Syntax-highlighted Code Editor + Interactive Question
 *  - Zona 4: Sticky CTA + Green/Red Bottom Sheet feedback + Result Modals
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L3MascotAnimated from '@/components/mascot/L3MascotAnimated.vue'
import MultipleChoiceQuestion from '@/components/quiz/MultipleChoiceQuestion.vue'
import FillBlankQuestion from '@/components/quiz/FillBlankQuestion.vue'
import ArrangeCodeQuestion from '@/components/quiz/ArrangeCodeQuestion.vue'
import QuizResultModal from '@/components/quiz/QuizResultModal.vue'
import { CurriculumService } from '@/core/services/CurriculumService.js'
import { validateNodeAnswer } from '@/core/services/quizEngine.js'
import { applyLevelTheme, getThemeCssVars } from '@/core/services/themeEngine.js'
import { tokenizeCodeLine } from '@/utils/codeSyntax.js'
import { gameStore } from '@/stores/gameStore.js'

const MAX_HEARTS = 5

const route = useRoute()
const router = useRouter()

// ─── Level State ──────────────────────────────────────────────────────────────
const isLoading = ref(true)
const loadError = ref('')
const trackId = ref('csharp')
const courseTitle = ref('')
const levelMeta = ref(null)
const nextLevelMeta = ref(null)
const levelData = ref(null)

// ─── Session State ────────────────────────────────────────────────────────────
const nodeIndex = ref(0)
const currentHearts = ref(MAX_HEARTS)
const sessionXpEarned = ref(0)
const lastNodeXp = ref(0)

// Answers & feedback
const selectedOption = ref('')
const fillInput = ref('')
const arrangedIds = ref([])
const feedbackState = ref(null) // null | 'correct' | 'incorrect'
const resultModal = ref(null) // null | { mode: 'complete' | 'gameover', perfectBonusXp: number, unlockedNextTitle: string }

// ─── Dynamic Theme ────────────────────────────────────────────────────────────
const activeTheme = ref(applyLevelTheme('csharp', 1))
const themeVars = computed(() => getThemeCssVars(activeTheme.value))

// ─── Computed Helpers ─────────────────────────────────────────────────────────
const nodes = computed(() => levelData.value?.nodes || [])
const totalNodes = computed(() => nodes.value.length || 10)
const currentNode = computed(() => nodes.value[nodeIndex.value] || null)

const totalXp = computed(() => gameStore.state.stats?.xp ?? 0)

const mascotVariant = computed(() => {
  if (feedbackState.value === 'correct') return 'happy'
  if (feedbackState.value === 'incorrect') return 'sad'
  return 'idle'
})

const typeBadgeLabel = computed(() => {
  const t = currentNode.value?.type
  if (t === 'multiple_choice') return 'MULTIPLE CHOICE'
  if (t === 'fill_blank') return 'FILL IN THE BLANK'
  if (t === 'arrange_code') return 'ARRANGE CODE'
  return 'SOAL'
})

const editorFilename = computed(() => {
  const map = {
    html: 'index.html',
    css: 'style.css',
    js: 'app.js',
    csharp: 'Program.cs',
    kotlin: 'Main.kt',
  }
  return map[trackId.value] || 'code.txt'
})

const trackBadgeName = computed(() => {
  const map = {
    html: 'WEB DEV',
    css: 'CSS',
    js: 'JAVASCRIPT',
    csharp: 'C#',
    kotlin: 'KOTLIN',
  }
  return map[trackId.value] || trackId.value.toUpperCase()
})

const shortCourseBadge = computed(() => {
  const map = {
    html: 'HTML Dasar',
    css: 'CSS Dasar',
    js: 'JS Dasar',
    csharp: 'C# Dasar',
    kotlin: 'Kotlin Dasar',
  }
  return map[trackId.value] || courseTitle.value
})

const displayBubbleText = computed(() => {
  if (!currentNode.value) return ''
  if (feedbackState.value === 'correct' && currentNode.value.mascotDialogue) {
    return currentNode.value.mascotDialogue
  }
  return currentNode.value.questionPrompt || currentNode.value.question
})

const preparedFragments = computed(() => {
  const n = currentNode.value
  if (!n || n.type !== 'arrange_code') return []
  const frags = [...(n.answerFragments || [])]
  const orderStr = (n.answerOrder || []).join(',')
  const fragStr = frags.map((f) => f.id).join(',')
  if (frags.length > 1 && fragStr === orderStr) {
    // Deterministic swap rotation so fragments never start pre-solved
    const first = frags.shift()
    frags.push(first)
  }
  return frags
})

const currentUserAnswer = computed(() => {
  const t = currentNode.value?.type
  if (t === 'multiple_choice') return selectedOption.value
  if (t === 'fill_blank') return fillInput.value
  if (t === 'arrange_code') return arrangedIds.value
  return null
})

const canSubmit = computed(() => {
  if (feedbackState.value !== null || !currentNode.value) return false
  const t = currentNode.value.type
  if (t === 'multiple_choice') return Boolean(selectedOption.value)
  if (t === 'fill_blank') return fillInput.value.trim().length > 0
  if (t === 'arrange_code') return arrangedIds.value.length > 0
  return false
})

const highlightedCodeLines = computed(() => {
  const raw = currentNode.value?.codeExample || ''
  if (!raw) return []
  return raw.split('\n').map((line) => tokenizeCodeLine(line))
})

// ─── Load & Session Recovery ──────────────────────────────────────────────────
function clearAnswerInputs() {
  selectedOption.value = ''
  fillInput.value = ''
  arrangedIds.value = []
  feedbackState.value = null
  lastNodeXp.value = 0
}

async function initLevel(levelId) {
  isLoading.value = true
  loadError.value = ''
  resultModal.value = null
  clearAnswerInputs()

  const found = CurriculumService.findLevelById(levelId)
  if (!found) {
    router.replace('/courses')
    return
  }

  // Guard: prevent direct URL jump into a locked level
  const progressMap = gameStore.state.progress || {}
  const status = progressMap[found.trackId]?.[levelId] || 'locked'
  if (status === 'locked') {
    router.replace(`/map/${found.trackId}`)
    return
  }

  trackId.value = found.trackId
  courseTitle.value = found.courseTitle
  levelMeta.value = found.level
  nextLevelMeta.value = found.nextLevel
  activeTheme.value = applyLevelTheme(found.trackId, found.level.num)

  try {
    const payload = await CurriculumService.loadLevelContent(
      found.trackId,
      found.level.num,
      levelId
    )
    levelData.value = payload

    // PRD F-09 Session Recovery
    const saved = gameStore.state.activeSession
    if (
      saved &&
      saved.levelId === levelId &&
      saved.currentHearts > 0 &&
      saved.nodeIndex >= 0 &&
      saved.nodeIndex < payload.nodes.length
    ) {
      nodeIndex.value = saved.nodeIndex
      currentHearts.value = saved.currentHearts
    } else {
      nodeIndex.value = 0
      currentHearts.value = MAX_HEARTS
      gameStore.saveSession({
        levelId,
        trackId: found.trackId,
        nodeIndex: 0,
        currentHearts: MAX_HEARTS,
      })
    }
    sessionXpEarned.value = 0
  } catch (err) {
    loadError.value = err?.message || 'Gagal memuat materi level.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  gameStore.refresh()
  initLevel(String(route.params.levelId || ''))
})

watch(
  () => route.params.levelId,
  (newId) => {
    if (newId) initLevel(String(newId))
  }
)

// ─── Quiz Actions ─────────────────────────────────────────────────────────────
function checkAnswer() {
  if (!canSubmit.value || !currentNode.value) return

  const { isCorrect, isEmpty } = validateNodeAnswer(
    currentNode.value,
    currentUserAnswer.value,
    { trackId: trackId.value }
  )
  if (isEmpty) return

  if (isCorrect) {
    feedbackState.value = 'correct'
    const xp = gameStore.claimNodeXp(currentNode.value.nodeId)
    lastNodeXp.value = xp
    sessionXpEarned.value += xp

    const nextIdx = Math.min(nodeIndex.value + 1, totalNodes.value - 1)
    gameStore.saveSession({
      levelId: levelMeta.value.id,
      trackId: trackId.value,
      nodeIndex: nextIdx,
      currentHearts: currentHearts.value,
    })
  } else {
    currentHearts.value = Math.max(0, currentHearts.value - 1)
    feedbackState.value = 'incorrect'

    if (currentHearts.value === 0) {
      gameStore.clearSession()
      resultModal.value = {
        mode: 'gameover',
        perfectBonusXp: 0,
        unlockedNextTitle: '',
      }
    } else {
      gameStore.saveSession({
        levelId: levelMeta.value.id,
        trackId: trackId.value,
        nodeIndex: nodeIndex.value,
        currentHearts: currentHearts.value,
      })
    }
  }
}

function handleNext() {
  if (nodeIndex.value + 1 >= totalNodes.value) {
    const { perfectBonusXp, unlockedNextLevelId } = gameStore.completeLevel({
      trackId: trackId.value,
      levelId: levelMeta.value.id,
      currentHearts: currentHearts.value,
      maxHearts: MAX_HEARTS,
    })
    const unlockedTitle =
      unlockedNextLevelId && nextLevelMeta.value
        ? `Level ${nextLevelMeta.value.num} • ${nextLevelMeta.value.title}`
        : ''
    resultModal.value = {
      mode: 'complete',
      perfectBonusXp,
      unlockedNextTitle: unlockedTitle,
    }
    return
  }

  nodeIndex.value += 1
  clearAnswerInputs()
}

function handleRetryNode() {
  feedbackState.value = null
}

function handleRestartLevel() {
  resultModal.value = null
  nodeIndex.value = 0
  currentHearts.value = MAX_HEARTS
  sessionXpEarned.value = 0
  clearAnswerInputs()
  gameStore.saveSession({
    levelId: levelMeta.value.id,
    trackId: trackId.value,
    nodeIndex: 0,
    currentHearts: MAX_HEARTS,
  })
}

function exitToMap() {
  router.push(`/map/${trackId.value}`)
}
</script>

<template>
  <div
    class="mobile-frame flex flex-col h-svh max-h-svh overflow-hidden transition-colors duration-300"
    :style="{
      ...themeVars,
      backgroundColor: 'var(--zq-bg-primary, #0B0F19)',
      color: 'var(--zq-text-primary, #FFFFFF)',
    }"
  >
    <!-- ── ZONA 1: TOP HUD ────────────────────────────────────────────────── -->
    <header
      class="shrink-0 px-4 pt-3 pb-2.5 flex items-center gap-3 border-b border-[#1A2238]"
      style="padding-top: max(12px, env(safe-area-inset-top))"
    >
      <!-- Close (X) -->
      <button
        type="button"
        aria-label="Keluar dari kuis"
        @click="exitToMap"
        class="w-9 h-9 rounded-full bg-[#13192B] border border-[#222B45] flex items-center justify-center text-[#8E9AB0] hover:text-white active:scale-95 transition-transform cursor-pointer shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Segmented 10-Node Progress Bar + Sub-info -->
      <div class="flex-1 min-w-0 flex flex-col gap-1.5">
        <div class="flex items-center gap-1">
          <div
            v-for="idx in totalNodes"
            :key="idx"
            class="h-1.5 flex-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            :style="{
              backgroundColor: idx - 1 < nodeIndex
                ? '#22C55E'
                : idx - 1 === nodeIndex
                  ? 'var(--zq-accent, #FF2B51)'
                  : '#1A2238',
              boxShadow: idx - 1 === nodeIndex ? '0 0 8px var(--zq-accent, #FF2B51)' : 'none'
            }"
          />
        </div>
        <div class="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
          <span class="text-[#8E9AB0]">NODE {{ nodeIndex + 1 }} DARI {{ totalNodes }}</span>
          <span class="flex items-center gap-1 text-[#F7DF1E]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F7DF1E">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
            </svg>
            {{ totalXp }} XP
          </span>
        </div>
      </div>

      <!-- Hearts Pill -->
      <div
        class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors"
        :class="currentHearts <= 1
          ? 'bg-[rgba(255,43,81,0.22)] border-[#FF2B51]'
          : 'bg-[#13192B] border-[#222B45]'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF2B51">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span class="text-[13px] font-extrabold text-white">{{ currentHearts }}</span>
      </div>
    </header>

    <!-- Loading / Error States -->
    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
      <div class="w-10 h-10 rounded-full border-3 border-[var(--zq-accent,#FF2B51)] border-t-transparent animate-spin" />
      <p class="text-[13px] text-[#8E9AB0]">Memuat soal level...</p>
    </div>

    <div v-else-if="loadError" class="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p class="text-[14px] text-[#FF2B51] font-semibold">{{ loadError }}</p>
      <button type="button" @click="exitToMap" class="btn-cta max-w-xs">KEMBALI KE PETA</button>
    </div>

    <!-- ── MAIN QUIZ BODY ─────────────────────────────────────────────────── -->
    <template v-else-if="currentNode">
      <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 py-3.5">
        <Transition name="ios-question" mode="out-in">
          <div :key="currentNode.nodeId" class="flex flex-col gap-3.5">

            <!-- ZONA 2: MASCOT + DIALOGUE / QUESTION BUBBLE -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Mascot Tile -->
          <div
            class="w-[68px] h-[68px] rounded-2xl border-2 p-1.5 flex items-center justify-center bg-[#13192B] transition-colors shrink-0"
            :style="{
              borderColor: feedbackState === 'correct'
                ? '#22C55E'
                : 'var(--zq-accent, #FF2B51)',
              boxShadow: '0 0 14px rgba(255,43,81,0.28)'
            }"
          >
            <L3MascotAnimated :variant="mascotVariant" />
          </div>

          <!-- Dialogue / Prompt Card -->
          <div
            class="flex-1 min-w-0 rounded-2xl border border-[#222B45] p-3 flex flex-col justify-between gap-2"
            style="background-color: var(--zq-bg-surface, #13192B)"
          >
            <div class="flex items-center justify-between gap-2">
              <span
                class="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase tracking-wider text-white"
                :style="{ backgroundColor: 'var(--zq-accent, #FF2B51)' }"
              >
                SOAL {{ nodeIndex + 1 }} • {{ typeBadgeLabel }}
              </span>
              <span class="text-[10px] font-semibold text-[#8E9AB0] truncate">
                {{ shortCourseBadge }}
              </span>
            </div>

            <p class="text-[13px] font-medium text-white leading-snug">
              {{ displayBubbleText }}
            </p>
          </div>
        </div>

        <!-- ZONA 3A: THEORY CONCEPT STRIP (PRD §5.3) -->
        <div
          v-if="currentNode.theory"
          class="rounded-xl border border-[#1E2942] bg-[#101626] px-3 py-2 flex flex-col gap-0.5"
        >
          <span class="text-[9.5px] font-extrabold uppercase tracking-widest text-[#8E9AB0]">
            Materi Konsep • {{ currentNode.title }}
          </span>
          <p class="text-[12px] text-[#CBD5E1] leading-snug">
            {{ currentNode.theory }}
          </p>
        </div>

        <!-- ZONA 3B: CODE EXAMPLE CARD (Matches UI Design Editor Header) -->
        <div
          v-if="currentNode.codeExample"
          class="rounded-xl border border-[#222B45] bg-[#0D1322] overflow-hidden shrink-0"
        >
          <div class="px-3.5 py-1.5 border-b border-[#1A2238] bg-[#11182A] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#FF2B51]" />
              <span class="text-[11.5px] font-code font-semibold text-[#CBD5E1]">{{ editorFilename }}</span>
            </div>
            <span class="text-[10px] font-bold tracking-widest uppercase text-[#8E9AB0]">
              {{ trackBadgeName }}
            </span>
          </div>
          <pre class="p-3 m-0 font-code text-[12.5px] leading-relaxed text-[#E2E8F0] overflow-x-auto whitespace-pre-wrap break-words"><template
            v-for="(lineTokens, lIdx) in highlightedCodeLines"
            :key="lIdx"
          ><span
            v-for="(tok, tIdx) in lineTokens"
            :key="tIdx"
            :class="tok.cls"
          >{{ tok.text }}</span><template v-if="lIdx < highlightedCodeLines.length - 1">{{ '\n' }}</template></template></pre>
        </div>

        <!-- ZONA 3C: INTERACTIVE QUESTION WORKSPACE -->
        <div class="pb-2">
          <MultipleChoiceQuestion
            v-if="currentNode.type === 'multiple_choice'"
            v-model="selectedOption"
            :options="currentNode.options"
            :disabled="feedbackState !== null"
            :feedback-state="feedbackState"
            :correct-option-id="currentNode.correctOptionId"
          />

          <FillBlankQuestion
            v-else-if="currentNode.type === 'fill_blank'"
            v-model="fillInput"
            :blank-template="currentNode.blankTemplate"
            :disabled="feedbackState !== null"
            :feedback-state="feedbackState"
            :track-id="trackId"
            @submit="checkAnswer"
          />

          <ArrangeCodeQuestion
            v-else-if="currentNode.type === 'arrange_code'"
            v-model="arrangedIds"
            :fragments="preparedFragments"
            :disabled="feedbackState !== null"
            :feedback-state="feedbackState"
            :editor-filename="editorFilename"
            :track-badge="trackBadgeName"
            :assembly-separator="currentNode.assemblySeparator"
          />
            </div>

          </div>
        </Transition>
      </div>

      <!-- ── ZONA 4: STICKY ACTION BAR / FEEDBACK BOTTOM SHEET ────────────── -->
      <div
        class="shrink-0 px-4 pt-2.5 pb-4 border-t border-[#1A2238] transition-colors duration-300"
        :class="feedbackState === 'correct'
          ? 'bg-[#0F241A] border-[#22C55E]/40'
          : feedbackState === 'incorrect'
            ? 'bg-[#261019] border-[#FF2B51]/40'
            : 'bg-[#0B0F19]'"
        style="padding-bottom: max(16px, env(safe-area-inset-bottom))"
      >
        <Transition name="ios-feedback" mode="out-in">
          <!-- Feedback Bottom Sheet Content -->
          <div v-if="feedbackState === 'correct'" key="correct" class="flex flex-col gap-3">
          <div class="flex items-start gap-2.5">
            <div class="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#0B0F19" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[13px] font-extrabold text-[#22C55E] uppercase tracking-wider">
                  Jawaban Benar!
                </span>
                <span
                  class="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                  :class="lastNodeXp > 0
                    ? 'bg-[rgba(247,223,30,0.16)] text-[#F7DF1E]'
                    : 'bg-[#1A2238] text-[#8E9AB0]'"
                >
                  {{ lastNodeXp > 0 ? `+${lastNodeXp} XP` : '+0 XP (Ulang)' }}
                </span>
              </div>
              <p class="text-[12.5px] text-[#E2E8F0] leading-snug mt-0.5">
                {{ currentNode.feedbackCorrect }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="handleNext"
            class="btn-cta !bg-[#22C55E] !text-[#052E16]"
          >
            {{ nodeIndex + 1 >= totalNodes ? 'SELESAIKAN LEVEL →' : 'LANJUT →' }}
          </button>
        </div>

        <div v-else-if="feedbackState === 'incorrect' && currentHearts > 0" key="incorrect" class="flex flex-col gap-3">
          <div class="flex items-start gap-2.5">
            <div class="w-6 h-6 rounded-full bg-[#FF2B51] flex items-center justify-center shrink-0 mt-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[13px] font-extrabold text-[#FF2B51] uppercase tracking-wider">
                  Belum Tepat
                </span>
                <span class="text-[11px] font-bold text-[#FF2B51]">
                  Sisa Nyawa: ♥ {{ currentHearts }}
                </span>
              </div>
              <p class="text-[12.5px] text-[#E2E8F0] leading-snug mt-0.5">
                {{ currentNode.feedbackIncorrect }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="handleRetryNode"
            class="btn-cta"
          >
            COBA LAGI ↻
          </button>
        </div>

        <!-- Default Check Answer CTA -->
        <button
          v-else
          key="idle"
          type="button"
          :disabled="!canSubmit"
          @click="checkAnswer"
          class="btn-cta"
          :style="canSubmit ? { backgroundColor: 'var(--zq-accent, #FF2B51)' } : {}"
        >
          PERIKSA JAWABAN →
        </button>
        </Transition>
      </div>
    </template>

    <!-- ── LEVEL COMPLETE / GAME OVER MODAL ──────────────────────────────── -->
    <Transition name="ios-dialog">
      <QuizResultModal
        v-if="resultModal"
        :mode="resultModal.mode"
        :level-title="`Level ${levelMeta?.num} • ${levelMeta?.title}`"
        :earned-xp="sessionXpEarned"
        :perfect-bonus-xp="resultModal.perfectBonusXp"
        :hearts-remaining="currentHearts"
        :unlocked-next-title="resultModal.unlockedNextTitle"
        @retry="handleRestartLevel"
        @exit="exitToMap"
      />
    </Transition>
  </div>
</template>
