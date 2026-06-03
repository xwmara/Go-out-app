import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectPublishedEvents } from "../features/events/eventSelectors";
import { fetchPublishedEvents } from "../features/events/eventsSlice";
import EventCard from "../components/common/EventCard";
import Reveal from "../components/common/Reveal";

export default function Events() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectPublishedEvents);

  useEffect(() => {
    void dispatch(fetchPublishedEvents());
  }, [dispatch]);

  return (
    <div className="space-y-8">
      <Reveal className="relative overflow-hidden rounded-4xl border border-white/10 bg-ink-850/60 p-6 shadow-card sm:rounded-5xl sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(207,47,99,0.22),transparent_50%)]" />
        <div className="relative">
          <p className="eyebrow">Explore</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-5xl">
            Toate evenimentele disponibile
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            O selectie clara, curata, cu accent vizual pe butoanele principale si pe actiunile de explorare.
          </p>
        </div>
      </Reveal>

      {events.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          Momentan nu exista evenimente publicate.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => (
            <Reveal key={event.id} delay={Math.min(index, 8) * 70}>
              <EventCard event={event} className="h-full" />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
