import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RoleSelector, { type AuthRole } from "./RoleSelector";

export default function LoginForm() {
  const navigate = useNavigate();

  const [role, setRole] = useState<AuthRole>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = "Email-ul este obligatoriu.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Introdu un email valid.";
    }

    if (!password.trim()) {
      newErrors.password = "Parola este obligatorie.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Login payload:", { email, password, role });

    if (role === "organizer") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <RoleSelector value={role} onChange={setRole} />

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemplu@email.com"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
          Parolă
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Introdu parola"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between text-sm">
        <button type="button" className="text-slate-500 hover:text-slate-900">
          Ai uitat parola?
        </button>

        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Creează cont
        </Link>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
      >
        Conectează-te
      </button>
    </form>
  );
}