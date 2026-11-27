<script setup>
/**
 * FillBlankQuestion
 * Mimo-style inline code input per PRD v1.6 §5.3 & §13 Decision #5.
 * Renders the monospace code template with a real <input type="text"> directly inside the ___ slot.
 */
import { computed, ref } from 'vue'

const props = defineProps({
  blankTemplate: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  feedbackState: { type: String, default: null }, // null | 'correct' | 'incorrect'
  trackId: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'submit'])
const inputRef = ref(null)

// Separate trailing prose instruction lines (e.g. "Jawaban diisi dengan...") from the code block
const parsedTemplate = computed(() => {
  const lines = String(props.blankTemplate || '').split('\n')
  const codeLines = []
  const hintLines = []

  for (const line of lines) {
    if (/^\s*Jawaban\b/i.test(line) && !line.includes('___')) {
      hintLines.push(line.trim())
    } else {
      codeLines.push(line)
    }
  }

  return {
    code: codeLines.join('\n').trim(),
    hint: hintLines.join(' '),
  }
})

const templateParts = computed(() => {
  if (!parsedTemplate.value.code) return []
  return parsedTemplate.value.code.split('___')
})

const hasInlineSlot = computed(() => templateParts.value.length >= 2)
const isCaseSensitive = computed(() => ['csharp', 'kotlin', 'js'].includes(props.trackId))

const cardBorderClass = computed(() => {
  if (props.feedbackState === 'correct') return 'border-[#22C55E] bg-[#0F2019]'
  if (props.feedbackState === 'incorrect') return 'border-[#FF2B51] bg-[#211119]'
  return 'border-[#222B45] focus-within:border-[var(--zq-accent,#FF2B51)] bg-[#0D1322]'
})

const inlineInputClass = computed(() => {
  if (props.feedbackState === 'correct') {
    return 'border-[#22C55E] bg-[rgba(34,197,94,0.16)] text-[#4ADE80]'
  }
  if (props.feedbackState === 'incorrect') {
    return 'border-[#FF2B51] bg-[rgba(255,43,81,0.16)] text-[#FCA5A5]'
  }
  return 'border-[var(--zq-accent,#FF2B51)] bg-[#161F35] text-white focus:bg-[#1C2640] focus:shadow-[0_0_10px_rgba(255,43,81,0.3)]'
})

function focusInlineInput() {
  if (!props.disabled) {
    inputRef.value?.focus()
  }
}
</script>

<template>
  <div
    class="rounded-xl border-[1.5px] p-3.5 transition-colors cursor-text"
    :class="cardBorderClass"
    @click="focusInlineInput"
  >
    <!-- Header Bar -->
    <div class="flex items-center justify-between gap-2 mb-2.5">
      <span class="text-[10.5px] font-bold uppercase tracking-widest text-[#8E9AB0]">
        Isi Langsung di Kode
      </span>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1A2238] text-[#8E9AB0]">
        {{ isCaseSensitive ? 'Case-Sensitive' : 'Ketik Sintaks' }}
      </span>
    </div>

    <!-- Mimo-style Inline Code Input (mirror span drives exact width; input sits inset-0 so default size=20 never inflates box) -->
    <pre
      v-if="hasInlineSlot"
      class="font-code text-[13.5px] text-[#E2E8F0] leading-[2] whitespace-pre-wrap break-words m-0"
    ><template
      v-for="(part, idx) in templateParts"
      :key="idx"
    >{{ part }}<span
      v-if="idx === 0 && idx < templateParts.length - 1"
      class="relative inline-block align-baseline mx-0.5 max-w-full"
    ><span
      aria-hidden="true"
      class="inline-block whitespace-pre px-2.5 py-0.5 border-[1.5px] border-transparent font-code text-[13.5px] font-bold leading-snug min-w-[4ch] max-w-full overflow-hidden invisible"
    >{{ modelValue || '___' }}</span><input
      ref="inputRef"
      :value="modelValue"
      :disabled="disabled"
      type="text"
      size="1"
      placeholder="___"
      aria-label="Isi bagian kode yang kosong"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @click.stop
      @input="emit('update:modelValue', $event.target.value)"
      @keyup.enter="!disabled && modelValue.trim() && emit('submit')"
      class="absolute inset-0 w-full h-full px-2.5 py-0.5 rounded-md border-[1.5px] font-code text-[13.5px] font-bold leading-snug text-center placeholder:text-[#64748B] outline-none transition-colors disabled:opacity-80"
      :class="inlineInputClass"
    /></span><span
      v-else-if="idx < templateParts.length - 1"
      class="inline-block px-2.5 py-0.5 mx-0.5 rounded-md border border-dashed border-[#475569] bg-[#1A2238] text-[#CBD5E1] font-code text-[13px] font-bold align-baseline"
    >{{ modelValue.trim() || '___' }}</span></template></pre>

    <!-- Fallback plain input if a node lacks ___ in template -->
    <input
      v-else
      ref="inputRef"
      :value="modelValue"
      :disabled="disabled"
      type="text"
      placeholder="Ketik jawaban di sini..."
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @input="emit('update:modelValue', $event.target.value)"
      @keyup.enter="!disabled && modelValue.trim() && emit('submit')"
      class="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-[#222B45] focus:border-[var(--zq-accent,#FF2B51)] text-white font-code text-[14px] placeholder:text-[#64748B] outline-none"
    />

    <!-- Optional Hint -->
    <p
      v-if="parsedTemplate.hint"
      class="text-[11.5px] text-[#8E9AB0] leading-snug mt-2.5 pt-2 border-t border-[#1A2238]"
    >
      {{ parsedTemplate.hint }}
    </p>
  </div>
</template>
