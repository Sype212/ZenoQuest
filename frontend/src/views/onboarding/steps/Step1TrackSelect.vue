<script setup>
/**
 * Step1TrackSelect - "Langkah 1 dari 3 • Pilih Jalur" (Screen 2)
 * Shows 5 track cards (HTML, CSS, JS, C#, Kotlin).
 * The mascot dialogue remains fixed at top while the courses list is vertically scrollable.
 */
import MascotDialogue from '@/components/onboarding/MascotDialogue.vue'
import TrackOptionCard from '@/components/onboarding/TrackOptionCard.vue'
import { CourseTrack } from '@/core/models/CourseTrack.js'

const props = defineProps({
  selectedTrack: { type: String, default: null },
})
const emit = defineEmits(['select'])

const tracks = CourseTrack.getAll()
</script>

<template>
  <div class="flex flex-col h-full min-h-0 px-5 pt-2 pb-1">

    <!-- Mascot dialogue bubble (Fixed at top) -->
    <div class="shrink-0 mb-3">
      <MascotDialogue stepLabel="LANGKAH 1 DARI 3 • PILIH JALUR">
        Pilih kurikulum utamamu. Kamu bebas berpindah jalur kapan saja di Peta Utama!
      </MascotDialogue>
    </div>

    <!-- Scrollable courses list (5 tracks: HTML, CSS, JS, C#, Kotlin) -->
    <div class="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-2.5 pb-2 pr-0.5 overscroll-contain">
      <TrackOptionCard
        v-for="track in tracks"
        :key="track.id"
        :track="track"
        :isSelected="selectedTrack === track.id"
        @select="emit('select', $event)"
      />
    </div>

  </div>
</template>
