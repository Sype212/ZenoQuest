<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AchievementToast from '@/components/common/AchievementToast.vue'

const router = useRouter()
const transitionName = ref('ios-tab')

const removeBeforeEach = router.beforeEach((to, from) => {
  if (to.name === 'quiz' && from.name && from.name !== 'quiz') {
    transitionName.value = 'ios-push'
  } else if (from.name === 'quiz' && to.name && to.name !== 'quiz') {
    transitionName.value = 'ios-pop'
  } else if (from.name === 'onboarding' && to.name && to.name !== 'onboarding') {
    transitionName.value = 'ios-push'
  } else {
    transitionName.value = 'ios-tab'
  }
})

onBeforeUnmount(() => {
  removeBeforeEach()
})
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="transitionName" mode="out-in">
      <component
        :is="Component"
        :key="route.name === 'quiz' ? route.fullPath : (route.name || route.path)"
      />
    </Transition>
  </RouterView>
  <AchievementToast />
</template>
