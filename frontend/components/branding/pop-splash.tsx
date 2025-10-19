"use client"

import { motion } from "framer-motion"

export function PopSplash() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {["P", "O", "P"].map((letter, i) => (
          <motion.span
            key={i}
            className="text-6xl font-bold gold-text"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
