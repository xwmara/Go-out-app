import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectPublishedEvents } from "../features/events/eventSelectors";
import { fetchPublishedEvents } from "../features/events/eventsSlice";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const primaryButtonClass =
  "rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-6 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95";

export default function Home() {
  const dispatch = useAppDispatch();
  const publishedEvents = useAppSelector(selectPublishedEvents);
  const featuredEvents = publishedEvents.slice(0, 3);

  useEffect(() => {
    void dispatch(fetchPublishedEvents());
  }, [dispatch]);

  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:rounded-[2rem]">
        <div className="grid gap-6 px-4 py-8 sm:px-8 sm:py-10 md:grid-cols-[1.2fr_0.8fr] md:px-12 md:py-12">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs uppercase tracking-[0.3em] text-violet-600">
              City life, events, tickets
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Descopera iesirile bune din oras intr-o experienta mai intensa.
              </h1>
              <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                Concerte, nightlife, expozitii si festivaluri intr-un univers vizual mai curat, dar cu accente vibrante pe actiunile importante.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/events" className={primaryButtonClass}>Vezi evenimentele</Link>
              <Link to="/search" className="rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Cauta rapid</Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[1.5rem] bg-slate-50 p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm uppercase tracking-[0.25em] text-slate-400">Publicate acum</p><p className="mt-3 text-4xl font-bold text-slate-950">{publishedEvents.length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm uppercase tracking-[0.25em] text-slate-400">Orase active</p><p className="mt-3 text-4xl font-bold text-slate-950">{new Set(publishedEvents.map((event) => event.city)).size}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm uppercase tracking-[0.25em] text-slate-400">Categorii</p><p className="mt-3 text-4xl font-bold text-slate-950">{new Set(publishedEvents.map((event) => event.category)).size}</p></div>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm uppercase tracking-[0.25em] text-slate-400">Recomandari</p><h2 className="mt-2 text-3xl font-bold text-slate-950">Evenimente in prim-plan</h2></div>
          <Link to="/events" className="text-sm font-semibold text-violet-600 transition hover:text-slate-950">Vezi toate</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
              <div className="h-48 bg-cover bg-center sm:h-56" style={{ backgroundImage: `url(${event.imageUrl})` }} />
              <div className="space-y-3 p-6">
                <div className="flex items-center justify-between text-sm text-slate-500"><span>{event.category}</span><span>{formatDate(event.date)}</span></div>
                <h3 className="text-2xl font-bold text-slate-950">{event.title}</h3>
                <p className="text-slate-600">{event.city}, {event.venueName}</p>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between"><span className="text-lg font-semibold text-slate-950">de la {event.ticketPrice ?? 49} lei</span><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">View</span></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
