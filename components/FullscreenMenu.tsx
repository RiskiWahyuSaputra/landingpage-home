"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import MagneticButton from "@/components/MagneticButton";

const links = [
  { label: "Home", href: "#home" },
  { label: "Architecture", href: "#architecture" },
  { label: "Gallery", href: "#gallery" },
  { label: "Location", href: "#location" },
  { label: "Contact", href: "#contact" },
] as const;

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/arskies_/",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/",
  },
  {
    label: "Email",
    href: "mailto:kiik37734@gmail.com",
  },
  {
    label: "Maps",
    href: "#location",
  },
] as const;

const scrollToSection = (href: string) => {
  const id = href.replace(/^#/, "");
  const targetElement = document.getElementById(id);

  if (targetElement) {
    targetElement.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const scrollTargets: Record<string, number> = {
    home: 0,
    architecture: 0.24,
    gallery: 0.39,
    location: 0.69,
    contact: 0.96,
  };

  const progress = scrollTargets[id] ?? 0;
  const doc = document.documentElement;
  const scrollHeight = doc.scrollHeight - window.innerHeight;

  window.scrollTo({
    top: Math.round(scrollHeight * progress),
    behavior: "smooth",
  });
};

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
          <div className="flex h-16 items-center justify-end px-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs uppercase tracking-widest text-offwhite/90 transition hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col items-start px-5">
            <div className="mt-10 flex w-full flex-col gap-4 md:gap-6">
              {links.map((link, idx) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.04,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  className="group inline-flex items-center gap-4 text-3xl font-medium tracking-tight md:text-5xl"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    scrollToSection(link.href);
                  }}
                >
                  <span className="w-10 text-xs tracking-[0.22em] text-offwhite/50">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="relative">
                    {link.label}
                    <span className="absolute left-0 right-0 bottom-0 h-px origin-left scale-x-0 bg-offwhite/70 transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                </motion.a>
              ))}
            </div>

            <div className="mt-10 w-full pt-6">
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm text-offwhite/80 sm:grid-cols-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="group inline-flex items-center gap-2 hover:text-offwhite"
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-offwhite/35 transition group-hover:bg-offwhite/75" />
                    <span className="relative">
                      {link.label}
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
