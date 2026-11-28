<script setup>
/**
 * Step3ProfileSetup - "Karakter Petualang" (Screen 4)
 * Nickname input + summary of chosen settings before entering the game.
 */
import MascotAvatar from '@/components/mascot/MascotAvatar.vue'
import { CourseTrack } from '@/core/models/CourseTrack.js'
import { computed } from 'vue'

const props = defineProps({
  nickname: { type: String, default: '' },
  selectedTrack: { type: String, default: 'html' },
  selectedMinutes: { type: Number, default: 10 },
})
const emit = defineEmits(['update:nickname', 'submit'])

const track = computed(() => CourseTrack.findById(props.selectedTrack))
const trackName = computed(() => track.value?.title || 'HTML Fundamentals')
const targetLabel = computed(() => `${props.selectedMinutes} Menit / Hari`)

const nicknameInput = computed({
  get: () => props.nickname,
  set: (val) => emit('update:nickname', val),
})

const isValidNick = computed(() => {
  const n = nicknameInput.value.trim()
  return n.length >= 3 && n.length <= 20
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0 overflow-y-auto scrollbar-hide px-5 pb-2 pt-4 gap-5 items-center justify-between">

    <!-- Mascot with happy image -->
    <div class="flex flex-col items-center gap-2.5 shrink-0">
      <MascotAvatar variant="happy" size="lg" />
      <div class="px-3 py-1 rounded-full border border-[#FF2B51] bg-[rgba(255,43,81,0.1)]">
        <span class="text-[11px] font-bold text-[#FF2B51] tracking-widest uppercase">Karakter Petualang</span>
      </div>
    </div>

    <!-- Nickname input -->
    <div class="w-full flex flex-col gap-1.5 shrink-0">
      <label class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
        Nickname Pemain
      </label>
      <input
        v-model="nicknameInput"
        @keyup.enter="isValidNick && emit('submit')"
        type="text"
        maxlength="20"
        placeholder="Masukkan nicknamemu (min. 3 huruf)..."
        class="w-full px-4 py-3 rounded-xl bg-[#13192B] border text-white text-[15px] font-medium placeholder:text-[#8E9AB0] outline-none transition-all"
        :class="nicknameInput.trim().length > 0
          ? (isValidNick ? 'border-[#FF2B51]' : 'border-red-500')
          : 'border-[#222B45] focus:border-[#FF2B51]'"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      <p class="text-[11px] text-[#8E9AB0]">
        Nama tersimpan secara lokal dan muncul pada dialog game.
      </p>
    </div>

    <!-- Summary card -->
    <div class="card-base w-full p-3.5 shrink-0 mb-1">
      <div class="grid grid-cols-3 divide-x divide-[#222B45]">
        <!-- Track -->
        <div class="flex flex-col gap-1 pr-3">
          <span class="text-[10px] font-bold text-[#FF2B51] uppercase tracking-wider">Jalur</span>
          <span class="text-[12px] font-bold text-white leading-tight line-clamp-2">{{ trackName }}</span>
        </div>
        <!-- Target -->
        <div class="flex flex-col gap-1 px-3">
          <span class="text-[10px] font-bold text-[#FF2B51] uppercase tracking-wider">Target</span>
          <span class="text-[12px] font-bold text-white leading-snug">{{ targetLabel }}</span>
        </div>
        <!-- Modal awal -->
        <div class="flex flex-col gap-1 pl-3">
          <span class="text-[10px] font-bold text-[#FF2B51] uppercase tracking-wider">Modal Awal</span>
          <span class="text-[12px] font-bold text-[#FF2B51] leading-snug">5 Hati &amp; 0 XP</span>
        </div>
      </div>
    </div>

  </div>
</template>
