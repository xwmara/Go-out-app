import type { ReactNode } from "react";

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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#5B1CDE] via-[#2B2340] to-[#111827]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">GetOut</h1>
            <p className="mt-3 max-w-md text-slate-300">
              Platforma ta pentru evenimente artistice, bilete, organizare și experiențe memorabile.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Descoperă evenimente.
              <br />
              Creează experiențe.
            </h2>
            <p className="mt-4 max-w-lg text-slate-300 text-lg">
              Intră în cont pentru a cumpăra bilete, salva favorite sau pentru a administra
              evenimentele tale ca organizer.
            </p>
          </div>

          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} GetOut App
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-8 bg-[#111827]">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}