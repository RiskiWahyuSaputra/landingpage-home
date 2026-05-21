"use client";

import { useEffect, useState } from "react";
import FullscreenMenu from "@/components/FullscreenMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "fixed left-0 right-0 top-0 z-[70] transition-all duration-300" +
        (scrolled
          ? " bg-black/40 backdrop-blur"
          : " bg-transparent backdrop-blur-0")
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-baseline gap-3">
          <div className="text-sm font-semibold tracking-[0.18em] text-offwhite">
            MFV
          </div>
          <div className="hidden text-xs tracking-[0.22em] text-offwhite/70 md:block">
            MODERN FOREST VILLA
          </div>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm uppercase tracking-wide text-offwhite/80 transition"
        >
          <span className="hidden sm:inline">Menu</span>
          <span
            className="h-px w-7 bg-offwhite/50 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </button>
      </div>

      <FullscreenMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
