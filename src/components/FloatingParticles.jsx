"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const PARTICLE_COUNT = 30;

export default function FloatingParticles() {
  const pathname = usePathname();

  if (pathname?.startsWith("/scanner")) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden" aria-hidden="true">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.25, 0.95, 0.25],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: (i % 5) * 0.4,
          }}
        />
      ))}
    </div>
  );
}
