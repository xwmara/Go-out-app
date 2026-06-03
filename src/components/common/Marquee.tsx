import type { ReactNode } from "react";

interface MarqueeProps {
  /** Items rendered repeatedly across the scrolling track. */
  items: ReactNode[];
  /** Scroll direction. */
  direction?: "left" | "right";
  /** Separator rendered between items. */
  separator?: ReactNode;
  className?: string;
}

/**
 * Seamless infinite marquee. The track is duplicated so the loop is gapless,
 * pauses on hover, and respects prefers-reduced-motion (handled globally in index.css).
 * Reuse it for artists, categories, cities or any keyword strip.
 */
export default function Marquee({
  items,
  direction = "left",
  separator,
  className = "",
}: MarqueeProps) {
  const animationClass = direction === "left" ? "animate-marquee" : "animate-marquee-reverse";

  const renderTrack = (ariaHidden: boolean) => (
    <div className={`flex shrink-0 items-center gap-8 pr-8 ${animationClass}`} aria-hidden={ariaHidden}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-8">
          <span>{item}</span>
          {separator ? <span className="text-wine-500/60">{separator}</span> : null}
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee-mask pause-on-hover flex overflow-hidden ${className}`}>
      {renderTrack(false)}
      {renderTrack(true)}
    </div>
  );
}
