"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setPos({ x: dx * 14, y: dy * 10 });
    };

    const handleLeave = () => setPos({ x: 0, y: 0 });

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", handleLeave);
    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <motion.button
      ref={ref}
      type="button"
      initial={{ opacity: 0.97 }}
      whileHover={{ boxShadow: "0 0 30px rgba(246,192,122,0.22)" }}
      className={
        "relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/30 px-6 py-3 text-sm tracking-wide uppercase text-offwhite/90 backdrop-blur" +
        " transition-colors duration-300 hover:bg-black/45 " +
        className
      }
      onClick={() => {
        // Optional: hook for modal/CTA.
      }}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300"
        style={{ transform: `translateX(${pos.x * 0.35}px)` }}
      />
    </motion.button>
  );
}
