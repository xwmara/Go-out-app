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
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Search</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Gaseste evenimentul potrivit</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cauta dupa titlu, categorie sau locatie" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-300" />
          <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-300">
            {cities.map((cityOption) => (<option key={cityOption} value={cityOption}>{cityOption === "all" ? "Toate orasele" : cityOption}</option>))}
          </select>
        </div>
      </div>
      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <Link key={event.id} to={`/events/${event.id}`} className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div><p className="text-sm uppercase tracking-[0.2em] text-slate-400">{event.category}</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{event.title}</h2><p className="mt-2 text-slate-600">{event.city}, {event.venueName}</p></div>
              <div className="text-right"><p className="text-sm text-slate-500">de la</p><p className="text-2xl font-bold text-slate-950">{event.ticketPrice ?? 49} lei</p></div>
            </div>
          </Link>
        ))}
        {filteredEvents.length === 0 ? (<div className="rounded-[1.5rem] bg-white p-8 shadow-[0_18px_48px_rgba(15,23,42,0.08)]"><h2 className="text-2xl font-bold text-slate-950">Nu am gasit rezultate</h2><p className="mt-3 text-slate-600">Incearca un alt oras sau un cuvant cheie mai general.</p></div>) : null}
      </div>
    </div>
  );
}
