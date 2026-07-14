"use client";

import { motion } from "framer-motion";

export default function HeroFadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      {children}
    </motion.div>
  );
}
