import { Link, NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store/hook";
import { logout } from "../../features/auth/authSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";

export default function OrganizerLayout() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-white font-semibold"
      : "text-slate-400 transition hover:text-white";

  return (
    <div className="relative min-h-screen bg-ink-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-ink-radial" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="Mergi la homepage">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-base font-black text-white shadow-glow-sm transition group-hover:brightness-110">
              G
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Go-Out <span className="text-wine-300">App</span>
            </span>
          </Link>

          <nav className="flex w-full flex-wrap items-center gap-3 text-sm sm:gap-5 lg:w-auto">
            <NavLink to="/organizer/dashboard" className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/organizer/marketing" className={navClass}>
              Marketing
            </NavLink>
            <NavLink to="/organizer/profile" className={navClass}>
              Profil
            </NavLink>
            <Link to="/organizer/events/create" className="btn-primary">
              Eveniment nou
            </Link>
            <button onClick={() => dispatch(logout())} className="btn-outline">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 animate-fade-up overflow-hidden rounded-4xl border border-white/10 bg-ink-850/70 p-6 shadow-card backdrop-blur-sm sm:p-8">
          <p className="eyebrow">Organizer account</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                {currentUser?.name ?? "Organizer"}
              </h1>
              <p className="mt-1 text-slate-400">{currentUser?.email}</p>
            </div>
            <Link to="/organizer/events" className="btn-outline">
              Vezi evenimentele tale
            </Link>
          </div>
        </section>

        <Outlet />
      </main>
    </div>
  );
}
