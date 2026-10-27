import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectOrganizerEvents } from "../features/events/eventSelectors";
import { fetchOrganizerEvents, setEventStatus } from "../features/events/eventsSlice";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function OrganizerEvents() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectOrganizerEvents);

  useEffect(() => {
    void dispatch(fetchOrganizerEvents());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Evenimentele tale</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white">My Events</h1>
          <p className="mt-2 text-slate-400">Vezi si administreaza evenimentele create.</p>
        </div>
        <Link to="/organizer/events/create" className="btn-primary">
          Create Event
        </Link>
      </div>

      <div className="card p-4 sm:p-6">
        {events.length === 0 ? (
          <p className="px-2 py-8 text-center text-slate-400">Nu ai inca evenimente create.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="flex animate-fade-up flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
              >
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{event.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{formatDate(event.date)} · {event.city} · {event.venueName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={event.status === "published" ? "pill-live" : "pill-draft"}>{event.status}</span>
                  <Link to={`/organizer/events/${event.id}/edit`} className="btn-ghost border border-white/10">
                    Edit
                  </Link>
                  {event.status === "draft" ? (
                    <button onClick={() => void dispatch(setEventStatus({ id: event.id, status: "published" }))} className="btn-primary">
                      Publish
                    </button>
                  ) : (
                    <span className="pill-live">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      Publicat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
