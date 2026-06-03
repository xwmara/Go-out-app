import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/store/hook";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { resolveEventHref } from "../../features/events/eventNavigation";
import type { EventItem } from "../../features/events/eventTypes";

interface EventCardProps {
  event: EventItem;
  /** Optional inline style (used for staggered animation delays). */
  style?: React.CSSProperties;
  className?: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/**
 * Premium, reusable event card with poster, meta and price.
 * Presentational only — routes to public details, or to the organizer edit
 * page when the current user owns the event.
 */
export default function EventCard({ event, style, className = "" }: EventCardProps) {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <Link
      to={resolveEventHref(event, currentUser)}
      style={style}
      className={`group card card-hover flex flex-col overflow-hidden ${className}`}
    >
      <div className="relative h-52 overflow-hidden sm:h-60">
        {event.imageUrl ? (
          <div
            className="h-full w-full bg-cover bg-center transition duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${event.imageUrl})` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-gradient p-5 text-center font-display text-2xl font-black text-white">
            {event.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-ink-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-wine-200 backdrop-blur-sm">
          {event.category}
        </span>
        <span className="absolute bottom-4 left-4 text-sm font-medium text-slate-200">
          {formatDate(event.date)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-display text-2xl font-bold leading-tight text-white transition group-hover:text-wine-200">
          {event.title}
        </h3>
        <p className="text-slate-400">
          {event.city}, {event.venueName}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">de la</p>
            <p className="text-lg font-bold text-white">{event.ticketPrice ?? 49} lei</p>
          </div>
          <span className="rounded-full bg-wine-600/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-wine-200 transition group-hover:bg-wine-600/30">
            Vezi detalii →
          </span>
        </div>
      </div>
    </Link>
  );
}
