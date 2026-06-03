import { Link } from "react-router-dom";
import Marquee from "../common/Marquee";
import Reveal from "../common/Reveal";
import type { EventItem } from "../../features/events/eventTypes";

interface RecapSectionProps {
  events: EventItem[];
}

/**
 * "Memories" strip — a cinematic, auto-scrolling gallery of real event posters.
 * Falls back gracefully when there is nothing to show.
 */
export default function RecapSection({ events }: RecapSectionProps) {
  const withImages = events.filter((event) => event.imageUrl);
  if (withImages.length === 0) return null;

  const posterNodes = withImages.map((event) => (
    <Link
      to={`/events/${event.id}`}
      className="group relative block h-56 w-44 shrink-0 overflow-hidden rounded-3xl border border-white/10 sm:h-72 sm:w-56"
    >
      <div
        className="h-full w-full bg-cover bg-center transition duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${event.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-wine-200">{event.city}</p>
        <p className="mt-1 line-clamp-2 font-display text-sm font-bold text-white">{event.title}</p>
      </div>
    </Link>
  ));

  return (
    <section className="space-y-8">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Memories</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold text-white sm:text-4xl">
            Momentele care raman cu tine.
          </h2>
        </div>
        <p className="max-w-sm text-slate-400">
          O privire peste energia evenimentelor de pe platforma — postere si vibe-uri din comunitatea Go-Out App.
        </p>
      </Reveal>

      <Reveal>
        <Marquee items={posterNodes} className="py-2" />
      </Reveal>
    </section>
  );
}
