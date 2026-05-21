"use client";

import { useEffect, useState } from "react";

export default function GrainOverlay() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Lightweight: enable only on client and after first paint.
    const t = window.setTimeout(() => setEnabled(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[60] transition-opacity duration-700 ${
        enabled ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage:
          "url(" +
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E" +
          ")",
        mixBlendMode: "overlay",
        opacity: 0.16,
      }}
    />
  );
}
