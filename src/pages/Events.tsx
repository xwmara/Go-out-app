import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectPublishedEvents } from "../features/events/eventSelectors";
import { fetchPublishedEvents } from "../features/events/eventsSlice";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const primaryButtonClass =
  "rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95";

export default function Events() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectPublishedEvents);

  useEffect(() => {
    void dispatch(fetchPublishedEvents());
  }, [dispatch]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Explore</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Toate evenimentele disponibile</h1>
        <p className="mt-3 max-w-2xl text-slate-600">O selectie clara, curata, cu accent vizual pe butoanele principale si pe actiunile de explorare.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <article key={event.id} className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }} />
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between text-sm text-slate-500"><span>{event.category}</span><span>{formatDate(event.date)}</span></div>
              <div><h2 className="text-2xl font-bold text-slate-950">{event.title}</h2><p className="mt-2 text-slate-600">{event.city}, {event.venueName}</p></div>
              <p className="line-clamp-3 text-slate-600">{event.description}</p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4"><div><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bilet</p><p className="text-xl font-bold text-slate-950">{event.ticketPrice ?? 49} lei</p></div><Link to={`/events/${event.id}`} className={primaryButtonClass}>Vezi detalii</Link></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
