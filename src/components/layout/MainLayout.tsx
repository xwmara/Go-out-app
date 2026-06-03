import { Link, NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store/hook";
import { logout } from "../../features/auth/authSlice";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BrandMark() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-base font-black text-white shadow-glow-sm transition group-hover:brightness-110">
        G
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-white">
        Go-Out <span className="text-wine-300">App</span>
      </span>
    </Link>
  );
}

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-white font-semibold"
      : "text-slate-400 transition hover:text-white";

  const actionButtonClass = "btn-primary";

  const iconButtonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white";

  return (
    <div className="relative min-h-screen bg-ink-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-ink-radial" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <BrandMark />

          <nav className="flex w-full flex-wrap items-center gap-3 text-sm sm:gap-5 lg:w-auto">
            <NavLink to="/events" className={navClass}>
              Evenimente
            </NavLink>

            {isAuthenticated && currentUser?.role === "client" ? (
              <>
                <NavLink to="/my-tickets" className={navClass}>
                  Biletele mele
                </NavLink>
                <NavLink to="/profile" className={navClass}>
                  Profilul meu
                </NavLink>
                <Link to="/search" className={iconButtonClass} aria-label="Cauta evenimente">
                  <SearchIcon />
                </Link>
                <button onClick={() => dispatch(logout())} className="btn-outline">
                  Logout
                </button>
              </>
            ) : isAuthenticated && currentUser?.role === "organizer" ? (
              <Link to="/organizer/dashboard" className={actionButtonClass}>
                Dashboard organizer
              </Link>
            ) : isAuthenticated && currentUser?.role === "admin" ? (
              <Link to="/admin" className={actionButtonClass}>
                Admin
              </Link>
            ) : (
              <>
                <Link to="/search" className={iconButtonClass} aria-label="Cauta evenimente">
                  <SearchIcon />
                </Link>
                <NavLink to="/login" className={navClass}>
                  Autentifica-te
                </NavLink>
                <Link to="/register" className={actionButtonClass}>
                  Inregistreaza-te
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <BrandMark />
          <p>© {new Date().getFullYear()} Go-Out App · Evenimente & bilete</p>
        </div>
      </footer>
    </div>
  );
}
