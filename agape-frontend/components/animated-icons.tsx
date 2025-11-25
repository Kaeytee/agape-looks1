"use client"

import { motion } from "framer-motion"

export const AnimatedProductIcon = () => {
	return (
		<div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20">
			<motion.svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="text-[#E91E8C]"
			>
				<motion.path
					d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
				/>
				<motion.path
					d="M12 12l8-4.5"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
				/>
				<motion.path
					d="M12 12v9"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{ duration: 1.5, delay: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
				/>
				<motion.path
					d="M12 12L4 7.5"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
				/>
			</motion.svg>
		</div>
	)
}

export const AnimatedOrderIcon = () => {
	return (
		<div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20">
			<motion.svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="text-[#E91E8C]"
			>
				<motion.circle
					cx="9"
					cy="21"
					r="1"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
				/>
				<motion.circle
					cx="20"
					cy="21"
					r="1"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, repeatType: "reverse" }}
				/>
				<motion.path
					d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
				/>
			</motion.svg>
		</div>
	)
}

export const AnimatedCustomerIcon = () => {
	return (
		<div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20">
			<motion.svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="text-[#E91E8C]"
			>
				<motion.path
					d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
				/>
				<motion.circle
					cx="9"
					cy="7"
					r="4"
					initial={{ scale: 0.8, opacity: 0.5 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
				/>
				<motion.path
					d="M22 21v-2a4 4 0 0 0-3-3.87"
					initial={{ opacity: 0, x: 5 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
				/>
				<motion.path
					d="M16 3.13a4 4 0 0 1 0 7.75"
					initial={{ opacity: 0, x: 5 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
				/>
			</motion.svg>
		</div>
	)
}
