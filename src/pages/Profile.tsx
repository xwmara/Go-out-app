import { Link } from "react-router-dom";
import { useAppSelector } from "../app/store/hook";
import { selectCurrentUser } from "../features/auth/authSelectors";
import { selectCurrentUserTickets } from "../features/tickets/ticketSelectors";

const primaryButtonClass =
  "inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95";

export default function Profile() {
  const currentUser = useAppSelector(selectCurrentUser);
  const myTickets = useAppSelector(selectCurrentUserTickets);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
          Profilul meu
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          {currentUser?.name ?? "Client"}
        </h1>
        <p className="mt-3 text-slate-600">
          Informatii esentiale despre contul tau si activitatea recenta din
          platforma.
        </p>
        <Link to="/events" className={`mt-6 ${primaryButtonClass}`}>
          Exploreaza evenimente
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Email
          </p>
          <p className="mt-3 text-lg font-bold text-slate-950">
            {currentUser?.email}
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Rol
          </p>
          <p className="mt-3 text-lg font-bold capitalize text-slate-950">
            {currentUser?.role}
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Bilete cumparate
          </p>
          <p className="mt-3 text-lg font-bold text-slate-950">
            {myTickets.length}
          </p>
        </div>
      </div>
    </div>
  );
}
