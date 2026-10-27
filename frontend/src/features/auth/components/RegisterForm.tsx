import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import RoleSelector from "./RoleSelector";
import type { UserRole } from "../authTypes";
import { useAppDispatch, useAppSelector } from "../../../app/store/hook";
import { clearAuthError, registerUser } from "../authSlice";
import {
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
  selectUserRole,
} from "../authSelectors";
import { getRedirectPathByRole } from "../authUtils";

export default function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const userRole = useAppSelector(selectUserRole);

  const [role, setRole] = useState<UserRole>("client");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(getRedirectPathByRole(userRole), { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (role === "client") {
      if (!firstName.trim()) newErrors.firstName = "Prenumele este obligatoriu.";
      if (!lastName.trim()) newErrors.lastName = "Numele este obligatoriu.";
    }

    if (role === "organizer") {
      if (!organizerName.trim()) {
        newErrors.organizerName = "Numele organizatorului este obligatoriu.";
      }
      if (!contactName.trim()) {
        newErrors.contactName = "Persoana de contact este obligatorie.";
      }
      if (!phone.trim()) {
        newErrors.phone = "Telefonul este obligatoriu.";
      }
    }

    if (!email.trim()) {
      newErrors.email = "Email-ul este obligatoriu.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Introdu un email valid.";
    }

    if (!password.trim()) {
      newErrors.password = "Parola este obligatorie.";
    } else if (password.length < 8) {
      newErrors.password = "Parola trebuie să aibă minim 8 caractere.";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirmarea parolei este obligatorie.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Parolele nu coincid.";
    }

    if (!acceptedTerms) {
      newErrors.acceptedTerms = "Trebuie să accepți termenii și condițiile.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(clearAuthError());

    if (!validate()) return;

    const name =
      role === "client"
        ? `${firstName.trim()} ${lastName.trim()}`.trim()
        : organizerName.trim();

    dispatch(
      registerUser({
        name,
        email,
        password,
        role,
      })
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoleSelector selectedRole={role} onChange={setRole} />

      {role === "client" ? (
        <>
          <div>
            <label className="field-label">
              Prenume
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input"
              placeholder="Prenume"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-rose-400">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="field-label">
              Nume
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input"
              placeholder="Nume"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-rose-400">{errors.lastName}</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="field-label">
              Nume organizator / companie
            </label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="input"
              placeholder="Ex: Art Events SRL"
            />
            {errors.organizerName && (
              <p className="mt-1 text-sm text-rose-400">{errors.organizerName}</p>
            )}
          </div>

          <div>
            <label className="field-label">
              Persoană de contact
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="input"
              placeholder="Nume complet"
            />
            {errors.contactName && (
              <p className="mt-1 text-sm text-rose-400">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label className="field-label">
              Telefon
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="07xxxxxxxx"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-rose-400">{errors.phone}</p>
            )}
          </div>
        </>
      )}

      <div>
        <label className="field-label">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="exemplu@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-rose-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="field-label">
          Parolă
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="Minim 8 caractere"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-rose-400">{errors.password}</p>
        )}
      </div>

      <div>
        <label className="field-label">
          Confirmă parola
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input"
          placeholder="Confirmă parola"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword}</p>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-4 w-4 accent-wine-600"
        />
        <span>Accept termenii și condițiile platformei.</span>
      </label>

      {errors.acceptedTerms && (
        <p className="text-sm text-rose-400">{errors.acceptedTerms}</p>
      )}

      {authError && (
        <p className="text-sm text-rose-400">{authError}</p>
      )}

      <div className="flex items-center justify-end text-sm">
        <Link to="/login" className="font-medium text-wine-300 transition hover:text-wine-200">
          Ai deja cont? Conectează-te
        </Link>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full py-3"
      >
        {status === "loading" ? "Se creează contul..." : "Creează cont"}
      </button>
    </form>
  );
}