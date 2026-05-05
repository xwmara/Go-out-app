import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectOrganizerEvents } from "../features/events/eventSelectors";
import { fetchOrganizerEvents, setEventStatus } from "../features/events/eventsSlice";
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
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function StatusBadge({ status }: { status: EventItem["status"] }) {
  const isPublished = status === "published";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
        isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
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
    navigate(`/organizer/events/${eventId}/edit`);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Dashboard</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Evenimentele listate</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Aici vezi toate evenimentele tale publicate sau salvate ca draft. Din fiecare card poti intra mai departe in zona de administrare a evenimentului.
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
        >
          + Listeaza eveniment
        </Link>
      </section>

      {sortedEvents.length === 0 ? (
        <section className="rounded-[2rem] bg-white p-8 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-bold text-slate-950">Nu ai inca evenimente listate</h2>
          <p className="mt-3 text-slate-600">Creeaza primul eveniment si el va aparea aici, in dashboardul organizerului.</p>
          <Link
            to="/organizer/events/create"
            className="mt-6 inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
          >
            Creeaza eveniment nou
          </Link>
        </section>
      ) : (
        <section className="space-y-6">
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
              className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
            >
              <div className="grid min-h-[280px] gap-0 lg:grid-cols-[240px_1fr_170px]">
                <div className="relative min-h-[220px] bg-slate-200 lg:min-h-full">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#8b5cf6,transparent_55%),linear-gradient(135deg,#111827,#1e293b)] p-6 text-center text-2xl font-black text-white">
                      {event.title}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center gap-4 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(88,28,135,0.88))] px-8 py-8 text-white">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={event.status} />
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                      {event.category}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black leading-tight">{event.title}</h2>
                    <p className="mt-3 text-lg font-semibold text-white/90">{formatDate(event.date)}</p>
                    <p className="mt-1 text-white/70">{event.city}, {event.venueName}</p>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm text-white/75">
                    <span>de la {event.ticketPrice ?? 0} lei</span>
                    <span>{event.availableTickets ?? 0} bilete disponibile</span>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-end gap-3 bg-white px-6 py-6 lg:flex-col lg:justify-center">
                  <button
                    type="button"
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      navigate(`/organizer/events/${event.id}/edit`);
                    }}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
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
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
                    aria-label={`Deschide ${event.title}`}
                  >
                    <EyeIcon />
                  </button>

                  {event.status === "draft" ? (
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        void dispatch(setEventStatus({ id: event.id, status: "published" }));
                      }}
                      className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
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
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
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
