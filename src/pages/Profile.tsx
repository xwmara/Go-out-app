import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectAuthError, selectAuthStatus, selectCurrentUser } from "../features/auth/authSelectors";
import { clearAuthError, updateProfile } from "../features/auth/authSlice";
import { selectCurrentUserTickets } from "../features/tickets/ticketSelectors";

const primaryButtonClass =
  "inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95";

export default function Profile() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const myTickets = useAppSelector(selectCurrentUserTickets);

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isOrganizerArea = useMemo(
    () => location.pathname.startsWith("/organizer/"),
    [location.pathname],
  );

  useEffect(() => {
    setName(currentUser?.name ?? "");
    setEmail(currentUser?.email ?? "");
  }, [currentUser?.email, currentUser?.name]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setValidationError(null);
    dispatch(clearAuthError());

    if (!name.trim()) {
      setValidationError("Numele este obligatoriu.");
      return;
    }

    if (!email.trim()) {
      setValidationError("Email-ul este obligatoriu.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Introdu un email valid.");
      return;
    }

    const result = await dispatch(
      updateProfile({
        name: name.trim(),
        email: email.trim(),
      }),
    );

    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage("Profilul a fost actualizat.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
          {isOrganizerArea ? "Profil organizer" : "Profilul meu"}
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          {currentUser?.name ?? (isOrganizerArea ? "Organizer" : "Client")}
        </h1>
        <p className="mt-3 text-slate-600">
          Aici iti poti actualiza informatiile de cont si poti verifica rapid statusul profilului tau.
        </p>
        <Link
          to={isOrganizerArea ? "/organizer/dashboard" : "/events"}
          className={`mt-6 ${primaryButtonClass}`}
        >
          {isOrganizerArea ? "Inapoi la dashboard" : "Exploreaza evenimente"}
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Editeaza profilul</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nume</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Nume complet"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="exemplu@email.com"
              />
            </div>

            {validationError ? <p className="text-sm text-red-500">{validationError}</p> : null}
            {authError ? <p className="text-sm text-red-500">{authError}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

            <button
              type="submit"
              disabled={authStatus === "loading"}
              className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authStatus === "loading" ? "Se salveaza..." : "Salveaza modificarile"}
            </button>
          </form>
        </section>

        <section className="grid gap-6">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Email actual</p>
            <p className="mt-3 text-lg font-bold text-slate-950">{currentUser?.email}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Rol</p>
            <p className="mt-3 text-lg font-bold capitalize text-slate-950">{currentUser?.role}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              {isOrganizerArea ? "Activitate cont" : "Bilete cumparate"}
            </p>
            <p className="mt-3 text-lg font-bold text-slate-950">{myTickets.length}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
