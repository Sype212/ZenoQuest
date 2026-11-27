<script setup>
/**
 * QuizResultModal
 * Modal shown on Level Complete (PRD §5.2 5a) or Game Over (PRD §5.2 5b).
 */
import MascotAvatar from '@/components/mascot/MascotAvatar.vue'

defineProps({
  mode: {
    type: String,
    required: true, // 'complete' | 'gameover'
  },
  levelTitle: { type: String, default: '' },
  earnedXp: { type: Number, default: 0 },
  perfectBonusXp: { type: Number, default: 0 },
  heartsRemaining: { type: Number, default: 0 },
  unlockedNextTitle: { type: String, default: '' },
})

const emit = defineEmits(['retry', 'exit'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-xs">
    <div class="mobile-frame !min-h-0 !bg-transparent flex items-center justify-center">
      <div class="w-full card-base p-6 flex flex-col items-center text-center gap-4 bg-[#13192B] border-[#222B45] shadow-2xl">
        <!-- Mascot -->
        <MascotAvatar
          :variant="mode === 'complete' ? 'happy' : 'sad'"
          size="md"
        />

        <!-- Title & Description -->
        <div class="flex flex-col gap-1.5">
          <span
            class="text-[11px] font-extrabold uppercase tracking-widest"
            :class="mode === 'complete' ? 'text-[#22C55E]' : 'text-[#FF2B51]'"
          >
            {{ mode === 'complete' ? 'Level Selesai!' : 'Nyawa Habis • Game Over' }}
          </span>
          <h2 class="text-[22px] font-extrabold text-white leading-tight">
            {{ mode === 'complete' ? 'Kerja Bagus, Petualang!' : 'Jangan Menyerah!' }}
          </h2>
          <p class="text-[13px] text-[#8E9AB0] leading-relaxed">
            <template v-if="mode === 'complete'">
              Kamu berhasil menuntaskan <strong class="text-white">{{ levelTitle }}</strong>.
              <span v-if="unlockedNextTitle" class="block mt-1 text-[#22C55E] font-semibold">
                Terbuka: {{ unlockedNextTitle }}
              </span>
            </template>
            <template v-else>
              5 Hati pada sesi ini habis. Tenang, XP yang sudah kamu kumpulkan tetap aman!
            </template>
          </p>
        </div>

        <!-- Rewards Summary (Level Complete) -->
        <div
          v-if="mode === 'complete'"
          class="w-full grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0B0F19] border border-[#222B45]"
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] font-bold uppercase text-[#8E9AB0]">XP Soal</span>
            <span class="text-[16px] font-extrabold text-[#F7DF1E]">+{{ earnedXp }}</span>
          </div>
          <div class="flex flex-col gap-0.5 border-x border-[#222B45]">
            <span class="text-[10px] font-bold uppercase text-[#8E9AB0]">Perfect Run</span>
            <span
              class="text-[16px] font-extrabold"
              :class="perfectBonusXp > 0 ? 'text-[#22C55E]' : 'text-[#64748B]'"
            >
              +{{ perfectBonusXp }}
            </span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] font-bold uppercase text-[#8E9AB0]">Sisa Hati</span>
            <span class="text-[16px] font-extrabold text-[#FF2B51]">♥ {{ heartsRemaining }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="w-full flex flex-col gap-2.5 mt-1">
          <button
            v-if="mode === 'gameover'"
            type="button"
            @click="emit('retry')"
            class="btn-cta"
          >
            ULANGI LEVEL ↻
          </button>

          <button
            type="button"
            @click="emit('exit')"
            :class="mode === 'complete'
              ? 'btn-cta'
              : 'w-full py-3.5 rounded-full bg-[#1A2238] border border-[#222B45] text-[#8E9AB0] hover:text-white font-bold text-[13px] uppercase tracking-wider cursor-pointer active:scale-95 transition-transform'"
          >
            KEMBALI KE PETA
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
