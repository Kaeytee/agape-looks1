export const SITE_CONFIG = {
  name: "AGAPE LOOKS",
  tagline: "Threads of Heritage",
  description: "Luxury Lace fabric handwoven by Ghanaian master artisans. Where ancient craft meets contemporary elegance.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://agapelooks.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+233591599253",
  brandValues: [
    "Heritage & Authenticity",
    "Craftsmanship & Artistry",
    "Cultural Pride",
    "Sustainable Luxury"
  ],
  socialProof: {
    yearsOfCraftsmanship: "Generations",
    masterArtisans: "20+",
    satisfiedCustomers: "500+"
  }
} as const

export const CURRENCY = {
  code: 'GHS',
  symbol: 'GH₵',
  name: 'Ghana Cedi',
  locale: 'en-GH',
} as const

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 992,
  largeDesktop: 1280,
} as const

export const ANIMATION = {
  duration: {
    fast: 120,
    normal: 280,
    slow: 340,
  },
  easing: {
    entrance: "cubic-bezier(0.22, 1, 0.36, 1)",
    exit: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  stagger: 40,
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 64,
} as const

export const PERFORMANCE = {
  imageSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageQuality: 85,
  lazyLoadOffset: "200px",
} as const
