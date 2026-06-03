import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectOrganizerEvents } from "../features/events/eventSelectors";
import { deleteEvent, fetchOrganizerEvents, setEventStatus } from "../features/events/eventsSlice";
import type { EventItem } from "../features/events/eventTypes";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function StatusLabel({ status }: { status: EventItem["status"] }) {
  const isPublished = status === "published";

  return (
    <span className={isPublished ? "pill-live" : "pill-draft"}>
      <span className={`h-2.5 w-2.5 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
      {isPublished ? "Live" : "Draft"}
    </span>
  );
}

export default function OrganizerDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const events = useAppSelector(selectOrganizerEvents);

  useEffect(() => {
    void dispatch(fetchOrganizerEvents());
  }, [dispatch]);

  const sortedEvents = [...events].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );

  const goToEventWorkspace = (eventId: string) => {
    navigate(`/organizer/events/${eventId}/overview`);
  };

  const handleDelete = async (eventId: string, title: string) => {
    const confirmed = window.confirm(`Sigur vrei sa stergi evenimentul "${title}"? Actiunea nu poate fi anulata.`);
    if (!confirmed) return;
    await dispatch(deleteEvent(eventId));
  };

  const iconButtonClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white";

  return (
    <div className="space-y-6 pb-8 sm:space-y-8 sm:pb-10">
      <section className="card animate-fade-up flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">Evenimente listate</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Vezi evenimentele postate si intra in zona de administrare pentru statistici, bilete, fiscalizare si promovare.
          </p>
        </div>
        <Link to="/organizer/events/create" className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
          + Listeaza eveniment
        </Link>
      </section>

      {sortedEvents.length === 0 ? (
        <section className="card p-8">
          <h2 className="font-display text-2xl font-bold text-white">Nu ai inca evenimente listate</h2>
          <p className="mt-3 max-w-xl text-slate-400">Creeaza primul eveniment si el va aparea aici, in dashboardul organizatorului.</p>
          <Link to="/organizer/events/create" className="btn-primary mt-6">
            Creeaza eveniment nou
          </Link>
        </section>
      ) : (
        <section className="space-y-5">
          {sortedEvents.map((event, index) => (
            <article
              key={event.id}
              role="button"
              tabIndex={0}
              onClick={() => goToEventWorkspace(event.id)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                  keyEvent.preventDefault();
                  goToEventWorkspace(event.id);
                }
              }}
              className="group card card-hover animate-fade-up cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-wine-400/70"
              style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
            >
              <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-[220px_1fr] md:items-center lg:grid-cols-[240px_1fr_180px] lg:p-7">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-soft md:h-[220px] md:aspect-auto">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-gradient p-5 text-center text-2xl font-black text-white">
                      {event.title || "Eveniment"}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusLabel status={event.status} />
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      {event.category || "Eveniment"}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                      {event.title || "Eveniment fara titlu"}
                    </h2>
                    <p className="mt-2 text-lg font-bold text-slate-200">{formatDate(event.date)}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-400">{event.city} · {event.venueName}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">de la {event.ticketPrice ?? 0} lei</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{event.availableTickets ?? 0} bilete disponibile</span>
                  </div>
                </div>

                <div className="flex flex-row flex-wrap items-center justify-between gap-4 md:col-span-2 lg:col-span-1 lg:flex-col lg:items-end lg:justify-start">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        navigate(`/organizer/events/${event.id}/edit`);
                      }}
                      className={iconButtonClass}
                      aria-label={`Editeaza ${event.title}`}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        goToEventWorkspace(event.id);
                      }}
                      className={iconButtonClass}
                      aria-label={`Deschide ${event.title}`}
                    >
                      <EyeIcon />
                    </button>
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        void handleDelete(event.id, event.title);
                      }}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-300 transition hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-200"
                      aria-label={`Sterge ${event.title}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {event.status === "draft" ? (
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        void dispatch(setEventStatus({ id: event.id, status: "published" }));
                      }}
                      className="btn-primary"
                    >
                      Publica
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        void dispatch(setEventStatus({ id: event.id, status: "draft" }));
                      }}
                      className="btn-outline"
                    >
                      Draft
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
