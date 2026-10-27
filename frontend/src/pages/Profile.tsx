import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectAuthError, selectAuthStatus, selectCurrentUser } from "../features/auth/authSelectors";
import { clearAuthError, updateProfile } from "../features/auth/authSlice";
import { selectCurrentUserTickets } from "../features/tickets/ticketSelectors";

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
      <div className="relative animate-fade-up overflow-hidden rounded-4xl border border-white/10 bg-ink-850/60 p-6 shadow-card sm:rounded-5xl sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(207,47,99,0.22),transparent_50%)]" />
        <div className="relative">
          <p className="eyebrow">{isOrganizerArea ? "Profil organizer" : "Profilul meu"}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-white">
            {currentUser?.name ?? (isOrganizerArea ? "Organizer" : "Client")}
          </h1>
          <p className="mt-3 text-slate-300">
            Aici iti poti actualiza informatiile de cont si poti verifica rapid statusul profilului tau.
          </p>
          <Link to={isOrganizerArea ? "/organizer/dashboard" : "/events"} className="btn-primary mt-6">
            {isOrganizerArea ? "Inapoi la dashboard" : "Exploreaza evenimente"}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="card animate-fade-up p-6" style={{ animationDelay: "0.05s" }}>
          <p className="eyebrow">Editeaza profilul</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">Nume</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Nume complet"
              />
            </div>

            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="exemplu@email.com"
              />
            </div>

            {validationError ? <p className="text-sm text-rose-400">{validationError}</p> : null}
            {authError ? <p className="text-sm text-rose-400">{authError}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}

            <button
              type="submit"
              disabled={authStatus === "loading"}
              className="btn-primary py-3"
            >
              {authStatus === "loading" ? "Se salveaza..." : "Salveaza modificarile"}
            </button>
          </form>
        </section>

        <section className="grid gap-5">
          <div className="card animate-fade-up p-6" style={{ animationDelay: "0.1s" }}>
            <p className="eyebrow">Email actual</p>
            <p className="mt-3 text-lg font-bold text-white">{currentUser?.email}</p>
          </div>
          <div className="card animate-fade-up p-6" style={{ animationDelay: "0.15s" }}>
            <p className="eyebrow">Rol</p>
            <p className="mt-3 text-lg font-bold capitalize text-white">{currentUser?.role}</p>
          </div>
          <div className="card animate-fade-up p-6" style={{ animationDelay: "0.2s" }}>
            <p className="eyebrow">{isOrganizerArea ? "Activitate cont" : "Bilete cumparate"}</p>
            <p className="mt-3 text-lg font-bold text-white">{myTickets.length}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
