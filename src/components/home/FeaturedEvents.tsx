import { Link } from "react-router-dom";
import EventCard from "../common/EventCard";
import Reveal from "../common/Reveal";
import type { EventItem } from "../../features/events/eventTypes";

interface FeaturedEventsProps {
  events: EventItem[];
  eyebrow: string;
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  emptyMessage?: string;
}

/**
 * Reusable events showcase block (grid of premium cards with staggered reveal).
 * Used for both "featured" and "popular/recent" sections — pass different data + copy.
 */
export default function FeaturedEvents({
  events,
  eyebrow,
  title,
  ctaLabel,
  ctaHref,
  emptyMessage = "Inca nu exista evenimente publicate. Revino curand.",
}: FeaturedEventsProps) {
  return (
    <section className="space-y-8">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">{title}</h2>
        </div>
        {ctaLabel && ctaHref ? (
          <Link to={ctaHref} className="text-sm font-semibold text-wine-300 transition hover:text-white">
            {ctaLabel} →
          </Link>
        ) : null}
      </Reveal>

      {events.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">{emptyMessage}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <Reveal key={event.id} delay={index * 80}>
              <EventCard event={event} className="h-full" />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
