import Marquee from "../common/Marquee";

interface MarqueeBarProps {
  items: string[];
}

export default function MarqueeBar({ items }: MarqueeBarProps) {
  if (items.length === 0) return null;

  const wordNodes = items.map((item) => (
    <span className="font-display text-2xl font-extrabold uppercase tracking-tight text-white/90 sm:text-3xl">
      {item}
    </span>
  ));

  return (
    <section className="border-y border-white/10 bg-ink-900/60 py-6">
      <Marquee items={wordNodes} separator={<span className="text-3xl">✦</span>} showArrows />
    </section>
  );
}
