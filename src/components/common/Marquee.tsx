import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface MarqueeProps {
  /** Items rendered repeatedly across the scrolling track. */
  items: ReactNode[];
  /** Separator rendered between items. */
  separator?: ReactNode;
  className?: string;
  /** Show prev/next arrow buttons for manual navigation. */
  showArrows?: boolean;
  /** Auto-scroll the track (still respects prefers-reduced-motion). */
  autoScroll?: boolean;
  /** Auto-scroll speed in pixels per frame. */
  speed?: number;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

/**
 * Seamless, never-empty marquee.
 * - Items are repeated enough to always fill the viewport, then duplicated so the
 *   loop wraps with no visible gap (resetting by exactly half a track is seamless).
 * - Auto-scrolls (paused on hover, disabled for prefers-reduced-motion).
 * - Optional arrow buttons let the user navigate manually.
 */
export default function Marquee({
  items,
  separator,
  className = "",
  showArrows = false,
  autoScroll = true,
  speed = 0.6,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);

  // Repeat the items just enough to fill the viewport width, then render the
  // resulting set twice so wrapping by half the scroll width is seamless.
  // (Kept lean so heavy content like posters doesn't render too many nodes.)
  const repeats = items.length > 0 ? Math.max(1, Math.ceil(8 / items.length)) : 0;
  const oneSet = Array.from({ length: repeats }, () => items).flat();
  const loop = [...oneSet, ...oneSet];

  // Keep the scroll position inside the first copy so content is always visible.
  const wrap = () => {
    const el = trackRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (half <= 0) return;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
    else if (el.scrollLeft < 0) el.scrollLeft += half;
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !autoScroll || items.length === 0) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const tick = () => {
      if (!pausedRef.current) {
        el.scrollLeft += speed;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoScroll, speed, items.length, loop.length]);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.6), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  const arrowClass =
    "absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-900/80 text-white shadow-soft backdrop-blur-sm transition hover:border-white/30 hover:bg-ink-800";

  return (
    <div className={`group relative ${className}`}>
      {showArrows ? (
        <button type="button" onClick={() => nudge(-1)} aria-label="Inapoi" className={`${arrowClass} left-2`}>
          <ChevronIcon direction="left" />
        </button>
      ) : null}

      <div
        ref={trackRef}
        onScroll={wrap}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        className="marquee-mask flex gap-8 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((item, index) => (
          <span key={index} className="flex shrink-0 items-center gap-8">
            <span>{item}</span>
            {separator ? <span className="text-wine-500/60">{separator}</span> : null}
          </span>
        ))}
      </div>

      {showArrows ? (
        <button type="button" onClick={() => nudge(1)} aria-label="Inainte" className={`${arrowClass} right-2`}>
          <ChevronIcon direction="right" />
        </button>
      ) : null}
    </div>
  );
}
