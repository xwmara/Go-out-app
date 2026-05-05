import { Link, NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store/hook";
import { logout } from "../../features/auth/authSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";

export default function OrganizerLayout() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-slate-950 font-semibold"
      : "text-slate-600 hover:text-slate-950";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/organizer/dashboard" className="text-xl font-black tracking-tight text-slate-950">
            Go-Out App
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            <NavLink to="/organizer/dashboard" className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/organizer/marketing" className={navClass}>
              Marketing
            </NavLink>
            <NavLink to="/organizer/profile" className={navClass}>
              Profil
            </NavLink>
            <Link
              to="/organizer/events/create"
              className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
            >
              Eveniment nou
            </Link>
            <button
              onClick={() => dispatch(logout())}
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 rounded-[1.75rem] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Organizer account</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-950">
                {currentUser?.name ?? "Organizer"}
              </h1>
              <p className="mt-1 text-slate-600">{currentUser?.email}</p>
            </div>
            <Link
              to="/organizer/events"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
            >
              Vezi evenimentele tale
            </Link>
          </div>
        </section>

        <Outlet />
      </main>
    </div>
  );
}
