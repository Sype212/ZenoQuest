import { createRouter, createWebHashHistory } from 'vue-router'
import { StorageService } from '@/core/services/StorageService.js'

// Lazy-load views for performance
const OnboardingView = () => import('@/views/onboarding/OnboardingView.vue')
const CoursesView    = () => import('@/views/app/CoursesView.vue')
const WorldMapView   = () => import('@/views/app/WorldMapView.vue')
const ProfileView    = () => import('@/views/app/ProfileView.vue')
const QuizArenaView  = () => import('@/views/quiz/QuizArenaView.vue')

const routes = [
  {
    path: '/',
    redirect: () => {
      // Boot guard: jika sudah punya profil ke courses, jika belum ke onboarding
      return StorageService.hasProfile() ? '/courses' : '/onboarding'
    },
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: OnboardingView,
    meta: { hideNav: true },
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesView,
    meta: { requiresProfile: true },
  },
  {
    // :trackId = 'html' | 'css' | 'js' | 'csharp' | 'kotlin' | 'active' (auto-detect)
    path: '/map/:trackId',
    name: 'map',
    component: WorldMapView,
    meta: { requiresProfile: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresProfile: true },
  },
  {
    path: '/quiz/:levelId',
    name: 'quiz',
    component: QuizArenaView,
    meta: { hideNav: true, requiresProfile: true },
  },
  // Catch-all fallback
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Global navigation guard
router.beforeEach((to) => {
  // Redirect halaman utama ke onboarding jika belum punya profil
  if (to.meta.requiresProfile && !StorageService.hasProfile()) {
    return { name: 'onboarding' }
  }

  // Resolve /map/active → /map/<selectedTrack>
  if (to.name === 'map' && to.params.trackId === 'active') {
    const p = StorageService.getProfile()
    const trackId = p?.selectedTrack || 'html'
    return { name: 'map', params: { trackId } }
  }
})

export default router
