import { Link, Outlet } from "react-router-dom";
import { useAppDispatch } from "../../app/store/hook";
import { logout } from "../../features/auth/authSlice";

export default function AdminLayout() {
  const dispatch = useAppDispatch();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/admin" className="text-xl font-bold">
            GoOut Admin
          </Link>

          <button
            onClick={() => dispatch(logout())}
            className="rounded-lg bg-white px-4 py-2 text-slate-900 hover:bg-slate-200"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}