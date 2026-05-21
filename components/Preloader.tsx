"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FRAME_COUNT,
  INITIAL_PRELOAD_COUNT,
  getFrameSrc,
} from "@/components/SequenceScroll";

export default function Preloader() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mountedAt, setMountedAt] = useState<number | null>(null);

  useEffect(() => {
    setMountedAt(Date.now());

    const preloadCount = Math.min(INITIAL_PRELOAD_COUNT, FRAME_COUNT);
    const urls: string[] = [];
    for (let i = 1; i <= preloadCount; i++) {
      urls.push(getFrameSrc(i));
    }

    let loaded = 0;
    const update = () => {
      loaded += 1;
      setProgress(Math.min(100, Math.round((loaded / preloadCount) * 100)));
      if (loaded >= preloadCount) setReady(true);
    };

    // Preload only the opening frames; the 4K sequence is lazy-loaded while scrolling.
    const imgs: HTMLImageElement[] = [];
    for (const u of urls) {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = u;
      img.onload = update;
      img.onerror = update; // tolerate missing frames
      imgs.push(img);
    }

    return () => {
      // allow gc
      imgs.length = 0;
    };
  }, []);

  const pct = useMemo(() => progress, [progress]);

  const opacity = ready ? 0 : 1;
  const pointerEvents = ready ? "none" : "auto";

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-stone-950 text-offwhite"
      style={{ opacity, transition: "opacity 700ms ease", pointerEvents }}
    >
      <div className="w-[min(520px,90vw)]">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-offwhite/70">
          <span>Loading residence</span>
          <span className="tabular-nums text-offwhite/80">{pct}%</span>
        </div>
        <div className="mt-4 h-px w-full overflow-hidden bg-white/10">
          <div
            className="h-px bg-brand-amber"
            style={{ width: `${pct}%`, transition: "width 120ms linear" }}
          />
        </div>
        <div className="mt-6 h-10 w-full">
          <div className="absolute" />
        </div>
      </div>

      <div className="pointer-events-none mt-10 text-center text-[11px] uppercase tracking-[0.32em] text-offwhite/35">
        Modern Forest Villa
      </div>

      {mountedAt && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 400px at 50% 40%, rgba(246,192,122,0.12), transparent 55%)",
            opacity: 0.9,
          }}
        />
      )}
    </div>
  );
}
