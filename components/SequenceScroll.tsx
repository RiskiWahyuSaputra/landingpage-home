"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import MagneticButton from "@/components/MagneticButton";

export const SOURCE_FRAME_COUNT = 1323;
export const FRAME_STEP = 3;
export const FRAME_COUNT =
  Math.floor((SOURCE_FRAME_COUNT - 1) / FRAME_STEP) + 1;
export const FRAME_PREFIX = "/sequence/";
export const FRAME_PAD = 5;
export const INITIAL_PRELOAD_COUNT = 10;
const MAX_RENDER_DPR = 1.5;
const PRELOAD_RADIUS = 3;
const MAX_CACHED_FRAMES = 18;
const MAX_PENDING_FRAMES = 8;

export function getFrameSrc(frameIndex: number) {
  const sourceFrame = Math.min(
    SOURCE_FRAME_COUNT,
    (frameIndex - 1) * FRAME_STEP + 1,
  );

  return `${FRAME_PREFIX}${String(sourceFrame).padStart(FRAME_PAD, "0")}.jpg`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function fadeInOut(p: number, start: number, peak: number, end: number) {
  if (p < start) return 0;
  if (p > end) return 0;
  if (p <= peak) return (p - start) / (peak - start);
  return 1 - (p - peak) / (end - peak);
}

function smoothStep(n: number) {
  const t = clamp(n, 0, 1);
  return t * t * (3 - 2 * t);
}

function fadeInHoldOut(
  p: number,
  start: number,
  fadeInEnd: number,
  fadeOutStart: number,
  end: number,
) {
  if (p <= start) return 0;
  if (p >= end) return 0;
  if (p < fadeInEnd) return smoothStep((p - start) / (fadeInEnd - start));
  if (p <= fadeOutStart) return 1;
  return 1 - smoothStep((p - fadeOutStart) / (end - fadeOutStart));
}

export default function SequenceScroll() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRafRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const latestFrameRef = useRef(1);
  const mountedRef = useRef(false);
  const frameCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const pendingFramesRef = useRef<Set<number>>(new Set());
  const lastDrawnImageRef = useRef<HTMLImageElement | null>(null);

  const scrollYProgress = useMotionValue(0);
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
  });

  const progressToFrame = useMemo(() => {
    return (p: number) =>
      clamp(Math.round(p * (FRAME_COUNT - 1)) + 1, 1, FRAME_COUNT);
  }, []);

  const updateScrollProgress = () => {
    const doc = document.documentElement;
    const scrollTop =
      window.scrollY || doc.scrollTop || document.body.scrollTop || 0;
    const scrollHeight = doc.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    scrollYProgress.set(clamp(progress, 0, 1));
  };

  const trimFrameCache = (centerFrame: number) => {
    const cache = frameCacheRef.current;
    if (cache.size <= MAX_CACHED_FRAMES) return;

    [...cache.keys()]
      .sort((a, b) => Math.abs(a - centerFrame) - Math.abs(b - centerFrame))
      .slice(MAX_CACHED_FRAMES)
      .forEach((key) => cache.delete(key));
  };

  const findNearestCachedFrame = (frameIndex: number) => {
    const cache = frameCacheRef.current;

    for (let offset = 0; offset <= PRELOAD_RADIUS * 3; offset++) {
      const before = cache.get(frameIndex - offset);
      if (before) return before;

      const after = cache.get(frameIndex + offset);
      if (after) return after;
    }

    return lastDrawnImageRef.current;
  };

  const loadFrame = (frameIndex: number) => {
    if (frameIndex < 1 || frameIndex > FRAME_COUNT) return null;

    const cached = frameCacheRef.current.get(frameIndex);
    if (cached) return cached;
    if (pendingFramesRef.current.has(frameIndex)) return null;
    if (pendingFramesRef.current.size >= MAX_PENDING_FRAMES) return null;

    pendingFramesRef.current.add(frameIndex);

    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = getFrameSrc(frameIndex);
    img.onload = async () => {
      try {
        await img.decode();
      } catch {
        // The browser can still draw the loaded frame if decode() rejects.
      }

      pendingFramesRef.current.delete(frameIndex);
      if (!mountedRef.current) return;

      frameCacheRef.current.set(frameIndex, img);
      trimFrameCache(latestFrameRef.current);

      if (frameIndex === latestFrameRef.current) {
        requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };
    img.onerror = () => {
      pendingFramesRef.current.delete(frameIndex);
    };

    return null;
  };

  const preloadAround = (frameIndex: number) => {
    loadFrame(frameIndex);

    for (let offset = 1; offset <= PRELOAD_RADIUS; offset++) {
      if (pendingFramesRef.current.size >= MAX_PENDING_FRAMES) break;
      loadFrame(frameIndex + offset);
      loadFrame(frameIndex - offset);
    }

    trimFrameCache(frameIndex);
  };

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img =
      frameCacheRef.current.get(frameIndex) ??
      loadFrame(frameIndex) ??
      findNearestCachedFrame(frameIndex);
    if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight)
      return;

    const dpr = Math.max(
      1,
      Math.min(MAX_RENDER_DPR, window.devicePixelRatio || 1),
    );
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const w = Math.floor(width * dpr);
    const h = Math.floor(height * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    const scale = Math.max(w / imgW, h / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const dx = (w - drawW) / 2;
    const dy = (h - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, drawW, drawH);
    lastDrawnImageRef.current = img;

    const grd = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.2,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.78,
    );
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(0,0,0,0.62)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  };

  useEffect(() => {
    mountedRef.current = true;
    preloadAround(1);

    const updateScroll = () => {
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(() => {
        updateScrollProgress();
      });
    };

    const onResize = () => {
      updateScrollProgress();
      drawFrame(latestFrameRef.current);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      mountedRef.current = false;
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", onResize);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      frameCacheRef.current.clear();
      pendingFramesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const nextFrame = progressToFrame(latest);
    if (nextFrame === latestFrameRef.current) return;

    latestFrameRef.current = nextFrame;
    setCurrentFrame(nextFrame);
    preloadAround(nextFrame);

    if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current);
    drawRafRef.current = requestAnimationFrame(() => drawFrame(nextFrame));
  });

  const p = (currentFrame - 1) / (FRAME_COUNT - 1);

  const OverlayBlock = ({
    at,
    align,
    index,
    kicker,
    title,
    sub,
    cta,
  }: {
    at: number;
    align: "center" | "left" | "right";
    index: string;
    kicker: string;
    title: string;
    sub: string;
    cta?: boolean;
  }) => {
    const opacity = fadeInHoldOut(p, at - 0.05, at + 0.01, at + 0.1, at + 0.16);
    const drift = clamp((at - p) * 54, -10, 22);
    const titleMeasure = align === "right" ? "max-w-[13ch]" : "max-w-[12ch]";

    return (
      <motion.div
        className="pointer-events-none absolute left-5 right-5 top-24 z-[50] md:left-10 md:right-auto md:top-28"
        style={{ opacity, y: drift }}
      >
        <div className="relative max-w-[620px] pl-5 text-left md:pl-7">
          <div
            className="absolute -left-2 -top-8 font-serif text-[5.25rem] leading-none text-brand-amber/10 md:-left-4 md:-top-10 md:text-[7.5rem]"
            aria-hidden
          >
            {index}
          </div>

          <div className="absolute left-0 top-1 h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-brand-amber via-white/20 to-transparent" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="font-serif text-4xl leading-none text-brand-amber/90 md:text-5xl">
                {index}
              </span>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-brand-amber/90 md:text-xs">
                  {kicker}
                </div>
                <div className="mt-2 h-px w-24 bg-gradient-to-r from-brand-amber/80 to-transparent" />
              </div>
            </div>

            <h2
              className={`mt-5 ${titleMeasure} font-serif text-4xl italic leading-[0.95] tracking-normal text-brand-offwhite drop-shadow-[0_10px_32px_rgba(0,0,0,0.55)] md:text-6xl`}
            >
              {title}
            </h2>
            <p className="mt-4 max-w-[34rem] text-sm leading-relaxed text-brand-offwhite/75 drop-shadow-[0_8px_22px_rgba(0,0,0,0.45)] md:text-base">
              {sub}
            </p>
          </div>

          {cta && (
            <div className="pointer-events-auto mt-6">
              <MagneticButton>Schedule a Private Viewing</MagneticButton>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <section className="relative h-[1300vh]">
      <div className="sticky top-0 h-screen w-full">
        <div className="relative h-full w-full">
          <canvas ref={canvasRef} className="block h-screen w-full" />

          <div className="absolute inset-0 z-[40] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/75" />
          </div>

          <OverlayBlock
            at={0.09}
            align="center"
            index="01"
            kicker="Forest Residence"
            title="Modern Forest Villa"
            sub="A cinematic architectural residence shaped by stone, wood, glass, and silence."
          />
          <OverlayBlock
            at={0.24}
            align="left"
            index="02"
            kicker="Arrival"
            title="Arrival framed by trees."
            sub="A quiet threshold where the driveway narrows, the canopy lowers, and the house begins to reveal itself slowly."
          />
          <OverlayBlock
            at={0.39}
            align="left"
            index="03"
            kicker="Material Mood"
            title="Dark stone. Warm timber. Quiet power."
            sub="A facade designed to disappear into the forest while glowing from within."
          />
          <OverlayBlock
            at={0.54}
            align="right"
            index="04"
            kicker="Light + Glass"
            title="Glass that catches the forest."
            sub="Full-height openings pull the landscape into the living spaces while keeping the architecture calm and grounded."
          />
          <OverlayBlock
            at={0.69}
            align="right"
            index="05"
            kicker="Inner Route"
            title="From arrival to retreat."
            sub="The sequence moves through the architecture, revealing the private rear garden and pool beyond."
          />
          <OverlayBlock
            at={0.83}
            align="left"
            index="06"
            kicker="Garden Room"
            title="A garden built for stillness."
            sub="Water, shadow, and planted edges shape a private outdoor room made for morning light and late evenings."
          />
          <OverlayBlock
            at={0.96}
            align="center"
            index="07"
            kicker="Private Tour"
            cta
            title="Experience the residence."
            sub="A private architectural retreat built for atmosphere, privacy, and timeless modern living."
          />

          <motion.footer
            className="absolute bottom-0 z-[45] w-full px-5 pb-6"
            style={{ opacity: fadeInOut(p, 0.9, 0.95, 1.02) }}
          >
            <div className="mx-auto max-w-6xl border-t border-white/10 pt-4 text-xs uppercase tracking-[0.22em] text-offwhite/60 md:flex md:items-center md:justify-between">
              <div>Modern Forest Villa © 2025</div>
              <div className="mt-2 md:mt-0">
                Architecture · Interior · Landscape
              </div>
              <div className="mt-2 md:mt-0 md:text-right">
                Contact / hello@modernforestvilla.com
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </section>
  );
}
