import { Link, NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store/hook";
import { logout } from "../../features/auth/authSlice";
import {
  selectIsAuthenticated,
  selectCurrentUser,
} from "../../features/auth/authSelectors";
import { getRedirectPathByRole } from "../../features/auth/authUtils";

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-slate-900 font-semibold"
      : "text-slate-600 hover:text-slate-900";

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            GoOut
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/" className={navClass}>
              Home
            </NavLink>
            <NavLink to="/events" className={navClass}>
              Events
            </NavLink>

            {isAuthenticated && currentUser ? (
              <>
                {currentUser.role === "client" ? (
  <Link to="/my-tickets" className="text-slate-600 hover:text-slate-900">
    Biletele mele
  </Link>
) : (
  <Link
    to={getRedirectPathByRole(currentUser.role)}
    className="text-slate-600 hover:text-slate-900"
  >
    Dashboard
  </Link>
)}
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-900">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                >
                  Register
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