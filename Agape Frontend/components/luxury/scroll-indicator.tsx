'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function ScrollIndicator() {
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    })
  }
  
  return (
    <motion.button
      onClick={handleScroll}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer group"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      aria-label="Scroll to content"
    >
      <span className="text-xs uppercase tracking-widest font-light">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
      
      {/* Scroll line */}
      <motion.div 
        className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{ transformOrigin: 'top' }}
      />
    </motion.button>
  )
}
