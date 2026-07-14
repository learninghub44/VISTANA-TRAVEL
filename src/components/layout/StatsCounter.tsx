"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 12, suffix: "+", label: "Years Curating East African Journeys" },
  { value: 4000, suffix: "+", label: "Travelers Guided" },
  { value: 3, suffix: "", label: "Countries Covered" },
  { value: 98, suffix: "%", label: "Guest Satisfaction Rate" },
];

function CountUpStat({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, stat.value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, stat.value]);

  return (
    <p ref={ref} className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
      {display.toLocaleString()}
      {stat.suffix}
    </p>
  );
}

export default function StatsCounter() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
        >
          <CountUpStat stat={stat} />
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-tight">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
