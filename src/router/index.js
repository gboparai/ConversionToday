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
const FontHome = () => import('../views/FontHome.vue')
const SubtitleHome = () => import('../views/SubtitleHome.vue')
const Compression = () => import('../views/Compression.vue')
const CompressionHome = () => import('../views/CompressionHome.vue')
const Merge = () => import('../views/Merge.vue')
const MergeHome = () => import('../views/MergeHome.vue')
const Compress = () => import('../views/Compress.vue')
const CompressHome = () => import('../views/CompressHome.vue')
const OcrHome = () => import('../views/OcrHome.vue')
const Ocr = () => import('../views/Ocr.vue')
const PdfImageHome = () => import('../views/PdfImageHome.vue')
const PdfImageType = () => import('../views/PdfImageType.vue')
const PdfImage     = () => import('../views/PdfImage.vue')
const PdfSplit     = () => import('../views/PdfSplit.vue')
const PdfPassword  = () => import('../views/PdfPassword.vue')
const MetadataHome = () => import('../views/MetadataHome.vue')
const Metadata     = () => import('../views/Metadata.vue')

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
  {
    path: '/compression',
    name: 'CompressionHome',
    component: CompressionHome
  },
  {
    path: '/compression/:format',
    name: 'Compression',
    component: Compression
  },
  {
    path: '/merge',
    name: 'MergeHome',
    component: MergeHome
  },
  {
    path: '/merge/:family/:format',
    name: 'Merge',
    component: Merge
  },
  {
    path: '/compress',
    name: 'CompressHome',
    component: CompressHome
  },
  {
    path: '/compress/:format',
    name: 'Compress',
    component: Compress
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
  // ── Font routes ───────────────────────────────────────────────────────────
  {
    path: '/font',
    name: 'FontHome',
    component: FontHome
  },
  {
    path: '/font/:format',
    name: 'FontFormat',
    component: Type
  },
  {
    path: '/font/:format/:format2',
    name: 'FontConversion',
    component: Convert
  },
  // ── Subtitle routes ─────────────────────────────────────────────────
  {
    path: '/subtitle',
    name: 'SubtitleHome',
    component: SubtitleHome
  },
  {
    path: '/subtitle/:format',
    name: 'SubtitleFormat',
    component: Type
  },
  {
    path: '/subtitle/:format/:format2',
    name: 'SubtitleConversion',
    component: Convert
  },
  // ── OCR routes ─────────────────────────────────────────────────────────────
  {
    path: '/ocr',
    name: 'OcrHome',
    component: OcrHome
  },
  {
    path: '/pdf-image',
    name: 'PdfImageHome',
    component: PdfImageHome
  },
  {
    path: '/pdf-image/:format',
    name: 'PdfImageType',
    component: PdfImageType
  },
  {
    path: '/pdf-image/:format/:format2',
    name: 'PdfImage',
    component: PdfImage
  },
  // ── PDF Split ─────────────────────────────────────────────────────────────
  {
    path: '/pdf-split',
    name: 'PdfSplit',
    component: PdfSplit
  },
  // ── PDF Password ──────────────────────────────────────────────────────────
  {
    path: '/pdf-password',
    name: 'PdfPasswordHome',
    component: PdfPassword
  },
  {
    path: '/pdf-password/:mode',
    name: 'PdfPassword',
    component: PdfPassword
  },
  {
    path: '/metadata-remover',
    name: 'MetadataHome',
    component: MetadataHome
  },
  {
    path: '/metadata-remover/:family/:format',
    name: 'Metadata',
    component: Metadata
  },
  {
    path: '/ocr/:outputFormat',
    redirect: to => `/ocr/image/${to.params.outputFormat}`
  },
  {
    path: '/ocr/:inputFormat/:outputFormat',
    name: 'Ocr',
    component: Ocr
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
