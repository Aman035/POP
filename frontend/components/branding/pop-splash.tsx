"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function PopSplash() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <Image
            src="/POP-logo.png"
            alt="POP Logo"
            width={120}
            height={120}
            className="w-30 h-30 object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
