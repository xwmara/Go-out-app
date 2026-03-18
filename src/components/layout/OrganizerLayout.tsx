import { Link, NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store/hook";
import { logout } from "../../features/auth/authSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";

export default function OrganizerLayout() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "rounded-lg bg-slate-900 px-3 py-2 text-white"
      : "rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100";

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white p-6">
          <Link to="/" className="mb-8 block text-2xl font-bold text-slate-900">
            GoOut
          </Link>

          <div className="mb-8 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Organizer account
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {currentUser?.name ?? "Organizer"}
            </p>
            <p className="text-sm text-slate-500">{currentUser?.email}</p>
          </div>

          <nav className="flex flex-col gap-2">
            <NavLink to="/organizer/dashboard" className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/organizer/events" className={navClass}>
              My Events
            </NavLink>
            <NavLink to="/organizer/events/create" className={navClass}>
              Create Event
            </NavLink>
          </nav>

          <button
            onClick={() => dispatch(logout())}
            className="mt-8 w-full rounded-xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
    
  );
}