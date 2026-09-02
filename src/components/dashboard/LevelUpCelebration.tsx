"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { acknowledgeLevelUp } from "@/app/dashboard/actions";

const CONFETTI_COLORS = ["#c6ff3d", "#7c5cfc", "#ff5d73", "#38d3e0", "#ffc93c"];

export function LevelUpCelebration({ level, title }: { level: number; title: string }) {
  const [open, setOpen] = useState(true);

  const close = () => {
    setOpen(false);
    void acknowledgeLevelUp();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="brutal-card relative w-full max-w-sm overflow-hidden bg-white p-8 text-center"
            initial={{ scale: 0.7, rotate: -3, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2 h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 320,
                  y: (Math.random() - 0.5) * 320,
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            ))}

            <p className="font-display text-sm font-bold uppercase tracking-widest text-violet">
              Новый уровень!
            </p>
            <p className="mt-2 font-display text-6xl font-extrabold">{level}</p>
            <p className="mt-1 font-display text-2xl font-bold">{title}</p>
            <p className="mt-3 text-sm text-ink-soft">Так держать — продолжай сдавать квесты!</p>

            <button onClick={close} className="brutal-btn mt-6 w-full bg-lime text-ink">
              Погнали дальше
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
