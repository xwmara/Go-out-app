import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectPublishedEvents } from "../features/events/eventSelectors";
import { fetchPublishedEvents } from "../features/events/eventsSlice";

export default function Search() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectPublishedEvents);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");

  useEffect(() => {
    void dispatch(fetchPublishedEvents());
  }, [dispatch]);

  const cities = useMemo(() => ["all", ...new Set(events.map((event) => event.city))], [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery = event.title.toLowerCase().includes(query.toLowerCase()) || event.category.toLowerCase().includes(query.toLowerCase()) || event.venueName.toLowerCase().includes(query.toLowerCase());
      const matchesCity = city === "all" || event.city === city;
      return matchesQuery && matchesCity;
    });
  }, [city, events, query]);

  return (
    <div className="space-y-8">
      <div className="relative animate-fade-up overflow-hidden rounded-4xl border border-white/10 bg-ink-850/60 p-6 shadow-card sm:rounded-5xl sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(207,47,99,0.22),transparent_55%)]" />
        <div className="relative">
          <p className="eyebrow">Search</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">Gaseste evenimentul potrivit</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cauta dupa titlu, categorie sau locatie" className="input" />
            <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
              {cities.map((cityOption) => (<option key={cityOption} value={cityOption} className="bg-ink-800 text-white">{cityOption === "all" ? "Toate orasele" : cityOption}</option>))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEvents.map((event, index) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="card card-hover animate-fade-up p-6"
            style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-wine-300/80">{event.category}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">{event.title}</h2>
                <p className="mt-2 text-slate-400">{event.city}, {event.venueName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">de la</p>
                <p className="text-2xl font-bold text-white">{event.ticketPrice ?? 49} lei</p>
              </div>
            </div>
          </Link>
        ))}
        {filteredEvents.length === 0 ? (
          <div className="card p-10 text-center">
            <h2 className="font-display text-2xl font-bold text-white">Nu am gasit rezultate</h2>
            <p className="mt-3 text-slate-400">Incearca un alt oras sau un cuvant cheie mai general.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
