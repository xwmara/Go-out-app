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

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-slate-950 font-semibold"
      : "text-slate-600 hover:text-slate-950";

  const actionButtonClass =
    "rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="text-xl font-black tracking-tight text-slate-950">
            Go-Out App
          </Link>

          <nav className="flex items-center gap-5 text-sm">
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
                <Link
                  to="/search"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
                  aria-label="Cauta evenimente"
                >
                  <SearchIcon />
                </Link>
                <button onClick={() => dispatch(logout())} className={actionButtonClass}>
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
                <Link
                  to="/search"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
                  aria-label="Cauta evenimente"
                >
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
