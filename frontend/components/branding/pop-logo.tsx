"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function PopLogo({ className = "" }: { className?: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const letterVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: (i: number) => ({
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        delay: i * 0.1,
      },
    }),
    hover: {
      scale: 1.06,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 400,
      },
    },
  }

  const confettiVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      x: [0, Math.random() * 60 - 30],
      y: [0, -Math.random() * 60 - 20],
      transition: {
        duration: 0.8,
        delay: i * 0.05,
      },
    }),
  }

  const handleClick = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1000)
  }

  return (
    <div
      className={`relative inline-flex items-center cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        {["P", "O", "P"].map((letter, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            initial="initial"
            animate={isHovered ? "hover" : "animate"}
            className="text-4xl font-bold gold-text"
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${i % 2 === 0 ? "#ffb238" : "#ff8a00"})`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
