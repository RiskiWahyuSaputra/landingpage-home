"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import MagneticButton from "@/components/MagneticButton";

const links = [
  "Home",
  "Architecture",
  "Gallery",
  "Location",
  "Contact",
] as const;

export default function FullscreenMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] backdrop-blur-xl bg-black/60 text-offwhite"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-end px-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-offwhite/80 hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="mx-auto flex max-w-6xl flex-col items-start px-5">
            <div className="mt-10 flex w-full flex-col gap-4 md:gap-6">
              {links.map((l, idx) => (
                <motion.a
                  key={l}
                  href="#"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.04,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  className="group inline-flex items-center gap-4 text-3xl font-medium tracking-tight md:text-5xl"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="w-10 text-xs tracking-[0.22em] text-offwhite/50">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="relative">
                    {l}
                    <span className="absolute left-0 right-0 bottom-0 h-px origin-left scale-x-0 bg-offwhite/70 transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                </motion.a>
              ))}
            </div>

            <div className="mt-10 w-full border-t border-white/10 pt-6">
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm text-offwhite/80 sm:grid-cols-4">
                {["Instagram", "Pinterest", "Email", "Maps"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="group inline-flex items-center gap-2 hover:text-offwhite"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-offwhite/35 transition group-hover:bg-offwhite/75" />
                    <span className="relative">
                      {s}
                      <span className="absolute left-0 right-0 -bottom-1 h-px origin-left scale-x-0 bg-offwhite/70 transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-6">
                <MagneticButton>Schedule a Private Viewing</MagneticButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
