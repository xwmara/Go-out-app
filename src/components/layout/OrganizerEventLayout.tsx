import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/hook";
import { selectAllEvents } from "../../features/events/eventSelectors";
import { fetchEventById } from "../../features/events/eventsSlice";

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M6 16V8" />
      <path d="M12 16V5" />
      <path d="M18 16v-3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4Z" />
      <path d="M9 9h.01" />
      <path d="M15 15h.01" />
    </svg>
  );
}

function FiscalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h10v18l-5-3-5 3Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </svg>
  );
}

function PromotionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 14 6a2 2 0 0 1 3 1.8v8.4A2 2 0 0 1 14 18l-11-5.5Z" />
      <path d="M7 14v5" />
      <path d="M17 9h2a2 2 0 0 1 0 4h-2" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function OrganizerEventLayout() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const event = useAppSelector((state) => selectAllEvents(state).find((item) => item.id === id)) ?? null;

  useEffect(() => {
    if (id) {
      void dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
      isActive
        ? "border-white/35 bg-white text-violet-700 shadow-lg"
        : "border-white/10 bg-white/6 text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="min-h-screen overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.28),transparent_24%),linear-gradient(135deg,#050816,#111827)] text-white shadow-[0_30px_90px_rgba(15,23,42,0.32)]">
      <div className="flex min-h-screen">
        <aside className="flex w-[92px] shrink-0 flex-col items-center justify-between bg-[linear-gradient(180deg,#7c3aed,#1f1147)] py-6 shadow-[24px_0_70px_rgba(76,29,149,0.3)]">
          <div className="flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => navigate("/organizer/dashboard")}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white transition hover:bg-white/20"
              aria-label="Inapoi la dashboard"
            >
              <BackIcon />
            </button>

            <nav className="flex flex-col gap-3">
              <NavLink to="overview" className={linkClass} aria-label="Overview">
                <OverviewIcon />
              </NavLink>
              <NavLink to="edit" className={linkClass} aria-label="Edit">
                <EditIcon />
              </NavLink>
              <NavLink to="tickets" className={linkClass} aria-label="Bilete">
                <TicketIcon />
              </NavLink>
              <NavLink to="fiscalizare" className={linkClass} aria-label="Fiscalizare">
                <FiscalIcon />
              </NavLink>
              <NavLink to="promovare" className={linkClass} aria-label="Promovare">
                <PromotionIcon />
              </NavLink>
            </nav>
          </div>

          <div className="w-full px-3 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-white/65">
            {event?.status === "published" ? "Live" : "Draft"}
          </div>
        </aside>

        <div className="flex-1 px-6 py-6 lg:px-10 lg:py-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Event workspace</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
                {event?.title ?? "Se incarca evenimentul..."}
              </h1>
              <p className="mt-3 text-white/65">
                {event ? `${event.city} • ${event.venueName} • ${new Date(event.date).toLocaleDateString("ro-RO")}` : "Administrare completa pentru evenimentul selectat."}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white/80">
              <span className={`h-2.5 w-2.5 rounded-full ${event?.status === "published" ? "bg-emerald-400" : "bg-amber-400"}`} />
              {event?.status === "published" ? "Eveniment publicat" : "Eveniment in draft"}
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
