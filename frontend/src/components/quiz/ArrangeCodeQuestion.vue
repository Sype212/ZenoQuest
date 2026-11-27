<script setup>
/**
 * ArrangeCodeQuestion
 * Interactive code-editor style assembly workspace matching ZenoQuest's dark IDE panel:
 * - Editor window header with filename, language badge, Undo, and Reset actions
 * - Line-numbered & auto-indented syntax-highlighted editor canvas (tap any placed token/line to remove)
 * - Syntax-highlighted bottom pool of available code fragments
 */
import { computed } from 'vue'
import { formatArrangedCodeLines, tokenizeCodeLine } from '@/utils/codeSyntax.js'

const props = defineProps({
  fragments: { type: Array, required: true }, // [{ id, code, description }]
  modelValue: { type: Array, default: () => [] }, // array of fragment IDs
  disabled: { type: Boolean, default: false },
  feedbackState: { type: String, default: null },
  editorFilename: { type: String, default: 'code.txt' },
  trackBadge: { type: String, default: 'KODE' },
  assemblySeparator: { type: String, default: ' ' },
})

const emit = defineEmits(['update:modelValue'])

const fragmentMap = computed(() => {
  const map = new Map()
  props.fragments.forEach((f) => map.set(f.id, f))
  return map
})

const selectedFragments = computed(() =>
  props.modelValue.map((id) => fragmentMap.value.get(id)).filter(Boolean)
)

const formattedLines = computed(() =>
  formatArrangedCodeLines(selectedFragments.value, {
    assemblySeparator: props.assemblySeparator,
  })
)

const tokenizedPool = computed(() =>
  props.fragments.map((frag) => ({
    ...frag,
    tokens: tokenizeCodeLine(frag.code),
  }))
)

function isUsed(id) {
  return props.modelValue.includes(id)
}

function addFragment(id) {
  if (props.disabled || isUsed(id)) return
  emit('update:modelValue', [...props.modelValue, id])
}

function removeAt(index) {
  if (props.disabled) return
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function undoLast() {
  if (props.disabled || props.modelValue.length === 0) return
  emit('update:modelValue', props.modelValue.slice(0, -1))
}

function resetAll() {
  if (props.disabled) return
  emit('update:modelValue', [])
}

const editorFrameClass = computed(() => {
  if (props.feedbackState === 'correct') return 'border-[#22C55E] bg-[#091510]'
  if (props.feedbackState === 'incorrect') return 'border-[#FF2B51] bg-[#180C13]'
  return 'border-[#222B45] bg-[#0B101E]'
})

const headerDotColor = computed(() => {
  if (props.feedbackState === 'correct') return '#22C55E'
  if (props.feedbackState === 'incorrect') return '#FF2B51'
  return 'var(--zq-accent, #FF2B51)'
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Real Code Editor Workspace -->
    <div
      class="rounded-xl border-[1.5px] overflow-hidden transition-colors"
      :class="editorFrameClass"
    >
      <!-- Editor Titlebar -->
      <div class="px-3 py-1.5 border-b border-[#1A2238] bg-[#11182A] flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span
            class="w-2 h-2 rounded-full shrink-0 transition-colors"
            :style="{ backgroundColor: headerDotColor }"
          />
          <span class="text-[11.5px] font-code font-semibold text-[#E2E8F0] truncate">
            {{ editorFilename }}
          </span>
          <span class="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1A2238] text-[#8E9AB0] shrink-0">
            Editor
          </span>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            :disabled="disabled || modelValue.length === 0"
            @click="undoLast"
            aria-label="Hapus blok terakhir"
            class="text-[11px] font-semibold text-[#8E9AB0] hover:text-white transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-default"
          >
            Hapus
          </button>
          <span class="w-px h-3 bg-[#1F2943]" />
          <button
            type="button"
            :disabled="disabled || modelValue.length === 0"
            @click="resetAll"
            class="flex items-center gap-1 text-[11px] font-semibold text-[#8E9AB0] hover:text-white transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-default"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 3v5h5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <!-- Line-Numbered Code Buffer -->
      <div class="py-2 font-code text-[12.5px] leading-[1.65] min-h-[96px]">
        <!-- Empty Buffer State -->
        <div v-if="formattedLines.length === 0" class="flex items-start">
          <span class="w-8 shrink-0 text-right pr-2.5 select-none text-[11px] text-[#475569] border-r border-[#162038]">
            1
          </span>
          <div class="flex-1 min-w-0 px-2.5 flex items-center gap-1 text-[#64748B] italic text-[12px]">
            <span
              class="inline-block w-[2px] h-4 animate-pulse shrink-0"
              :style="{ backgroundColor: headerDotColor }"
            />
            <span>// Ketuk blok kode di bawah untuk menulis...</span>
          </div>
        </div>

        <!-- Formatted Indented Code Lines -->
        <div v-else class="flex flex-col">
          <div
            v-for="(line, lIdx) in formattedLines"
            :key="line.lineNumber"
            class="flex items-stretch transition-colors"
            :class="!disabled ? 'hover:bg-white/[0.02]' : ''"
          >
            <!-- Line Number Gutter -->
            <span class="w-8 shrink-0 text-right pr-2.5 py-[2px] select-none text-[11px] text-[#475569] border-r border-[#162038]">
              {{ line.lineNumber }}
            </span>

            <!-- Line Code + Indent Guides + Interactive Tokens -->
            <div class="flex-1 min-w-0 pl-2.5 pr-2.5 py-[2px] flex flex-wrap items-center">
              <!-- Visual Indentation Guides -->
              <span
                v-for="indentIdx in line.indentLevel"
                :key="`ind-${indentIdx}`"
                aria-hidden="true"
                class="inline-block w-3 self-stretch border-l border-[#1E2A45] shrink-0"
              />

              <!-- Placed Code Fragment(s) on this Line -->
              <div
                class="flex flex-wrap items-baseline flex-1 min-w-0"
                :class="line.joinGap === '' ? 'gap-0' : 'gap-x-1 gap-y-1'"
              >
                <button
                  v-for="item in line.items"
                  :key="`${item.id}-${item.origIndex}`"
                  type="button"
                  :disabled="disabled"
                  @click="removeAt(item.origIndex)"
                  :title="disabled ? undefined : 'Ketuk untuk hapus dari editor'"
                  class="font-code text-[12.5px] leading-[1.55] text-left break-words whitespace-pre-wrap transition-colors"
                  :class="feedbackState === 'correct'
                    ? 'px-0.5 py-0 border-transparent bg-transparent cursor-default'
                    : feedbackState === 'incorrect'
                      ? 'px-1 py-[1px] rounded-[4px] bg-[#FF2B51]/12 border-b border-dashed border-[#FF2B51]/60 cursor-default'
                      : 'px-1 py-[1px] rounded-[4px] bg-white/[0.03] hover:bg-[#FF2B51]/15 active:bg-[#FF2B51]/25 border-b border-dashed border-[#334155]/75 hover:border-[#FF2B51]/70 cursor-pointer'"
                >
                  <span
                    v-for="(tok, tIdx) in item.tokens"
                    :key="tIdx"
                    :class="tok.cls"
                  >{{ tok.text }}</span>
                </button>

                <!-- Blinking Editor Cursor at End of Last Line -->
                <span
                  v-if="lIdx === formattedLines.length - 1 && !disabled"
                  aria-hidden="true"
                  class="inline-block w-[2px] h-4 ml-0.5 align-middle animate-pulse shrink-0"
                  :style="{ backgroundColor: headerDotColor }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subtle IDE Status Footer -->
      <div class="px-3 py-1 border-t border-[#162038] bg-[#090E1A]/90 flex items-center justify-between text-[10px] text-[#64748B]">
        <span class="font-semibold tracking-wider uppercase">
          {{ trackBadge }} • {{ selectedFragments.length }}/{{ fragments.length }} blok
        </span>
        <span v-if="!disabled && selectedFragments.length > 0">
          Ketuk kode di editor untuk hapus
        </span>
        <span v-else-if="feedbackState === 'correct'" class="text-[#22C55E] font-semibold">
          Struktur valid ✓
        </span>
        <span v-else>
          Susunan urut 1 → {{ fragments.length }}
        </span>
      </div>
    </div>

    <!-- Shuffled Chip Pool -->
    <div class="flex flex-col gap-2">
      <span class="text-[11px] font-bold uppercase tracking-widest text-[#8E9AB0]">
        Pilihan Blok Kode
      </span>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="frag in tokenizedPool"
          :key="frag.id"
          type="button"
          :disabled="disabled || isUsed(frag.id)"
          @click="addFragment(frag.id)"
          class="px-3 py-2 rounded-lg border font-code text-[12.5px] leading-snug transition-all text-left break-words whitespace-normal"
          :class="isUsed(frag.id)
            ? 'bg-[#0F1524] border-[#1A2238] opacity-40 cursor-default'
            : 'bg-[#13192B] border-[#222B45] hover:border-[var(--zq-accent,#FF2B51)] active:scale-95 cursor-pointer'"
        >
          <span
            v-for="(tok, tIdx) in frag.tokens"
            :key="tIdx"
            :class="isUsed(frag.id) ? 'text-[#64748B]' : tok.cls"
          >{{ tok.text }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
