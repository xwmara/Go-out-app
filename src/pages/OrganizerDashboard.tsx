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
    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-black text-slate-950 shadow-sm">
      <span className={`h-3 w-3 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
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

  return (
    <div className="space-y-6 pb-8 sm:space-y-8 sm:pb-10">
      <section className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.09)] sm:rounded-[1.75rem] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Evenimente listate</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Vezi evenimentele postate si intra in zona de administrare pentru statistici, bilete, fiscalizare si promovare.
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-6 py-3 text-base font-black text-white shadow-lg shadow-violet-200 transition hover:opacity-95 sm:w-auto sm:px-7"
        >
          + Listeaza eveniment
        </Link>
      </section>

      {sortedEvents.length === 0 ? (
        <section className="rounded-[1.75rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-black text-slate-950">Nu ai inca evenimente listate</h2>
          <p className="mt-3 max-w-xl text-slate-600">Creeaza primul eveniment si el va aparea aici, in dashboardul organizatorului.</p>
          <Link
            to="/organizer/events/create"
            className="mt-6 inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-6 py-3 font-black text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
          >
            Creeaza eveniment nou
          </Link>
        </section>
      ) : (
        <section className="space-y-7">
          {sortedEvents.map((event) => (
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
              className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] outline-none transition hover:-translate-y-1 hover:shadow-[0_30px_85px_rgba(15,23,42,0.16)] focus-visible:ring-2 focus-visible:ring-violet-300 sm:rounded-[1.75rem] md:min-h-[300px]"
            >
              {event.imageUrl ? (
                <img src={event.imageUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-2xl" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(124,58,237,0.35),transparent_30%),linear-gradient(135deg,#2f185f,#0f172a)]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_33%,rgba(255,255,255,0.74)_57%,rgba(255,255,255,0.46)_100%)]" />              <div className="relative grid gap-5 p-4 sm:p-6 md:min-h-[300px] md:grid-cols-[200px_1fr] md:items-center lg:grid-cols-[230px_1fr_180px] lg:p-7">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.15rem] bg-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.16)] md:h-[250px] md:aspect-auto">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#7c3aed,#111827)] p-5 text-center text-2xl font-black text-white">
                      {event.title || "Eveniment"}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusLabel status={event.status} />
                    <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {event.category || "Eveniment"}
                    </span>
                  </div>

                  <div>
                    <h2 className="max-w-3xl text-2xl font-black leading-tight text-slate-950 sm:text-3xl md:text-4xl">
                      {event.title || "Eveniment fara titlu"}
                    </h2>
                    <p className="mt-2 text-lg font-black text-slate-700">{formatDate(event.date)}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{event.city} • {event.venueName}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                    <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1">de la {event.ticketPrice ?? 0} lei</span>
                    <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1">{event.availableTickets ?? 0} bilete disponibile</span>
                  </div>
                </div>

                <div className="flex flex-row flex-wrap items-center justify-between gap-4 md:col-span-2 lg:col-span-1 lg:flex-col lg:items-end lg:justify-start">
                  <div className="flex items-center gap-3 text-slate-700">
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        navigate(`/organizer/events/${event.id}/edit`);
                      }}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
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
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
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
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
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
                      className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-2 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
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
                      className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
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

