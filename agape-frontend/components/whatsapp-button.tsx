'use client'

import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function WhatsAppButton() {
    const whatsappNumber = "0591599253"
    // Format for WhatsApp API: Country code (233) + number without leading 0
    const whatsappLink = `https://wa.me/233${whatsappNumber.substring(1)}`

    return (
        <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors duration-300"
        >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="font-semibold text-lg">Chat</span>
        </motion.a>
    )
}
