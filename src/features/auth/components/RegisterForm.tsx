import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RoleSelector, { type AuthRole } from "./RoleSelector";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [role, setRole] = useState<AuthRole>("client");

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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (role === "client") {
      if (!firstName.trim()) newErrors.firstName = "Prenumele este obligatoriu.";
      if (!lastName.trim()) newErrors.lastName = "Numele este obligatoriu.";
    }

    if (role === "organizer") {
      if (!organizerName.trim()) newErrors.organizerName = "Numele organizatorului este obligatoriu.";
      if (!contactName.trim()) newErrors.contactName = "Persoana de contact este obligatorie.";
      if (!phone.trim()) newErrors.phone = "Telefonul este obligatoriu.";
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    const payload =
      role === "client"
        ? {
            role,
            firstName,
            lastName,
            email,
            password,
          }
        : {
            role,
            organizerName,
            contactName,
            phone,
            email,
            password,
          };

    console.log("Register payload:", payload);

    if (role === "organizer") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">    
      <RoleSelector value={role} onChange={setRole} />

      {role === "client" ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Prenume</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="Prenume"
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nume</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="Nume"
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nume organizator / companie</label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="Ex: Art Events SRL"
            />
            {errors.organizerName && (
              <p className="mt-1 text-sm text-red-500">{errors.organizerName}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Persoană de contact</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="Nume complet"
            />
            {errors.contactName && (
              <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Telefon</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="07xxxxxxxx"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>
        </>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="exemplu@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Parolă</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="Minim 8 caractere"
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Confirmă parola</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="Confirmă parola"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1"
        />
        <span>Accept termenii și condițiile platformei.</span>
      </label>
      {errors.acceptedTerms && (
        <p className="text-sm text-red-500">{errors.acceptedTerms}</p>
      )}

      <div className="flex items-center justify-end text-sm">
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Ai deja cont? Conectează-te
        </Link>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
      >
        Creează cont
      </button>
    </form>
  );
}