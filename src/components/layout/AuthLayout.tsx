import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(207,47,99,0.4),transparent_45%),linear-gradient(150deg,#4e1027,#15101b_70%)]" />
          <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-wine-600/30 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-lg font-black text-white shadow-glow-sm">
                G
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                Go-Out <span className="text-wine-300">App</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-slate-300">
              Platforma ta pentru evenimente artistice, bilete, organizare si experiente memorabile.
            </p>
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
              Descopera evenimente.
              <br />
              Creeaza experiente.
            </h2>
            <p className="mt-4 max-w-lg text-lg text-slate-300">
              Intra in cont pentru a cumpara bilete, salva favorite sau pentru a administra
              evenimentele tale ca organizer.
            </p>
          </div>

          <div className="relative z-10 text-sm text-slate-400">
            © {new Date().getFullYear()} Go-Out App
          </div>
        </div>

        <div className="relative flex items-center justify-center overflow-hidden px-6 py-12 sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-ink-radial lg:hidden" />
          <div className="relative z-10 w-full max-w-md animate-fade-up rounded-4xl border border-white/10 bg-ink-850/80 p-8 shadow-card backdrop-blur-sm">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-extrabold text-white">{title}</h2>
              <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
