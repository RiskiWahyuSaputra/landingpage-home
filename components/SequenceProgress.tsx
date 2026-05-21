"use client";

export default function SequenceProgress({
  frame,
  count,
}: {
  frame: number;
  count: number;
}) {
  return (
    <div className="absolute left-5 top-20 z-[55] hidden select-none md:block">
      <div className="flex items-center gap-3">
        <div className="h-px w-16 bg-white/10" />
        <div className="text-xs uppercase tracking-[0.22em] text-offwhite/60">
          Frame {String(frame).padStart(3, "0")}/
          {String(count).padStart(3, "0")}
        </div>
      </div>
    </div>
  );
}
