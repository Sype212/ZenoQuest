<script setup>
/**
 * Step2TargetSelect - "Langkah 2 dari 3 • Target Harian" (Screen 3)
 * Experience level selection + daily target duration.
 */
import MascotDialogue from '@/components/onboarding/MascotDialogue.vue'
import ExperienceCard from '@/components/onboarding/ExperienceCard.vue'
import DailyTargetCard from '@/components/onboarding/DailyTargetCard.vue'
import { DailyTarget } from '@/core/models/DailyTarget.js'

const props = defineProps({
  selectedExperience: { type: String, default: null },
  selectedMinutes: { type: Number, default: 10 },
})
const emit = defineEmits(['selectExperience', 'selectMinutes'])

const targets = DailyTarget.getAll()

const experienceOptions = [
  {
    id: 'beginner',
    icon: '🌱',
    label: 'Pemula Nol',
    description: 'Perlu panduan langkah demi langkah',
  },
  {
    id: 'intermediate',
    icon: '💻',
    label: 'Pernah Koding',
    description: 'Ingin latihan sintaks & logika',
  },
]
</script>

<template>
  <div class="flex flex-col h-full min-h-0 overflow-y-auto scrollbar-hide gap-4 px-5 pt-2 pb-2">

    <!-- Mascot dialogue -->
    <div class="shrink-0">
      <MascotDialogue stepLabel="LANGKAH 2 DARI 3 • TARGET HARIAN">
        Berapa lama kamu ingin berlatih setiap hari? Atur sesuai ritme belajarmu!
      </MascotDialogue>
    </div>

    <!-- Experience level -->
    <div class="flex flex-col gap-2 shrink-0">
      <span class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
        Pengalaman Koding
      </span>
      <div class="grid grid-cols-2 gap-2.5">
        <ExperienceCard
          v-for="exp in experienceOptions"
          :key="exp.id"
          v-bind="exp"
          :isSelected="selectedExperience === exp.id"
          @select="emit('selectExperience', $event)"
        />
      </div>
    </div>

    <!-- Daily target -->
    <div class="flex flex-col gap-2 shrink-0 pb-2">
      <span class="text-[11px] font-bold text-[#8E9AB0] uppercase tracking-widest">
        Target Waktu Harian
      </span>
      <div class="flex flex-col gap-2">
        <DailyTargetCard
          v-for="target in targets"
          :key="target.minutes"
          :target="target"
          :isSelected="selectedMinutes === target.minutes"
          @select="emit('selectMinutes', $event)"
        />
      </div>
    </div>

  </div>
</template>
