import { Link, Outlet } from "react-router-dom";
import { useAppDispatch } from "../../app/store/hook";
import { logout } from "../../features/auth/authSlice";

export default function AdminLayout() {
  const dispatch = useAppDispatch();

  return (
    <div className="relative min-h-screen bg-ink-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-ink-radial" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="group flex items-center gap-2.5">
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Go-Out <span className="text-wine-300">App</span>
              <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin
              </span>
            </span>
          </Link>

          <button onClick={() => dispatch(logout())} className="btn-outline">
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
