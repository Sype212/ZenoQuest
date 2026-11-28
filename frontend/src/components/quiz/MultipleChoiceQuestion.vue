<script setup>
/**
 * MultipleChoiceQuestion
 * Vertical 4-option choice list matching ZenoQuest UI card styling.
 */
defineProps({
  options: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  feedbackState: { type: String, default: null }, // null | 'correct' | 'incorrect'
  correctOptionId: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])

function optionClasses(optId, props) {
  const isSelected = props.modelValue === optId
  if (props.feedbackState === 'correct' && isSelected) {
    return 'border-[#22C55E] bg-[rgba(34,197,94,0.12)] shadow-[0_0_12px_rgba(34,197,94,0.22)]'
  }
  if (props.feedbackState === 'incorrect' && isSelected) {
    return 'border-[#FF2B51] bg-[rgba(255,43,81,0.12)] shadow-[0_0_12px_rgba(255,43,81,0.22)]'
  }
  if (isSelected) {
    return 'border-[var(--zq-accent,#FF2B51)] bg-[rgba(255,43,81,0.1)] shadow-[0_0_12px_rgba(255,43,81,0.2)]'
  }
  return 'border-[#222B45] bg-[#13192B] hover:border-[#334166]'
}
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      :disabled="disabled"
      @click="emit('update:modelValue', opt.id)"
      class="ios-press w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-[1.5px] text-left cursor-pointer disabled:cursor-default"
      :class="optionClasses(opt.id, $props)"
    >
      <!-- Letter Badge -->
      <span
        class="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-extrabold uppercase shrink-0 border transition-colors"
        :class="modelValue === opt.id
          ? 'bg-[var(--zq-accent,#FF2B51)] border-[var(--zq-accent,#FF2B51)] text-white'
          : 'bg-[#1A2238] border-[#2A3555] text-[#8E9AB0]'"
      >
        {{ opt.id }}
      </span>

      <!-- Option Text -->
      <span class="flex-1 text-[13.5px] font-medium text-white font-code leading-snug break-words">
        {{ opt.text }}
      </span>

      <!-- Radio Circle -->
      <span
        class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
        :class="modelValue === opt.id
          ? 'border-[var(--zq-accent,#FF2B51)] bg-[var(--zq-accent,#FF2B51)]'
          : 'border-[#2A3555]'"
      >
        <span v-if="modelValue === opt.id" class="w-1.5 h-1.5 rounded-full bg-white" />
      </span>
    </button>
  </div>
</template>
