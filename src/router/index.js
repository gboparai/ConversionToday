import { createRouter, createWebHistory } from 'vue-router'
const LandingHome  = () => import('../views/LandingHome.vue')
const Home  = () => import('../views/Home.vue')
const Type  = () => import('../views/Type.vue')
const Convert  = () => import('../views/Convert.vue')
const FAQ  = () => import('../views/FAQ.vue')
const About  = () => import('../views/About.vue')
const AudioHome = () => import('../views/AudioHome.vue')
const VideoHome = () => import('../views/VideoHome.vue')
const DocumentHome = () => import('../views/DocumentHome.vue')
const ArchiveHome = () => import('../views/ArchiveHome.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: LandingHome,
    
  },
  {
    path: '/image',
    name: 'ImageHome',
    component: Home,
    
  },
  // ── Image routes ────────────────────────────────────────────────────────
  {
    path: '/image/:format',
    name: 'ImageFormat',
    component: Type
  },
  {
    path: '/image/:format/:format2',
    name: 'ImageConversion',
    component: Convert
  },
  // ── Audio routes ────────────────────────────────────────────────────────
  {
    path: '/audio',
    name: 'AudioHome',
    component: AudioHome
  },
  {
    path: '/audio/:format',
    name: 'AudioFormat',
    component: Type
  },
  {
    path: '/audio/:format/:format2',
    name: 'AudioConversion',
    component: Convert
  },
  // ── Video routes ────────────────────────────────────────────────────────
  {
    path: '/video',
    name: 'VideoHome',
    component: VideoHome
  },
  {
    path: '/video/:format',
    name: 'VideoFormat',
    component: Type
  },
  {
    path: '/video/:format/:format2',
    name: 'VideoConversion',
    component: Convert
  },
  // ── Document routes ──────────────────────────────────────────────────────
  {
    path: '/document',
    name: 'DocumentHome',
    component: DocumentHome
  },
  {
    path: '/document/:format',
    name: 'DocumentFormat',
    component: Type
  },
  {
    path: '/document/:format/:format2',
    name: 'DocumentConversion',
    component: Convert
  },
  // ── Archive routes ────────────────────────────────────────────────────────
  {
    path: '/archive',
    name: 'ArchiveHome',
    component: ArchiveHome
  },
  {
    path: '/archive/:format',
    name: 'ArchiveFormat',
    component: Type
  },
  {
    path: '/archive/:format/:format2',
    name: 'ArchiveConversion',
    component: Convert
  },
  {
    path: '/FAQ',
    name: 'FAQ',
    component: FAQ
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
