import { Link } from "react-router-dom";

interface HeroSectionProps {
  eventCount: number;
  cityCount: number;
  categoryCount: number;
  backgroundImage?: string;
}

export default function HeroSection({
  eventCount,
  cityCount,
  categoryCount,
  backgroundImage,
}: HeroSectionProps) {
  const stats = [
    { label: "Evenimente live", value: eventCount },
    { label: "Orase", value: cityCount },
    { label: "Categorii", value: categoryCount },
  ];

  return (
    <section className="relative -mt-2 overflow-hidden rounded-4xl border border-white/10 bg-ink-900 shadow-card sm:rounded-5xl">
      {backgroundImage ? (
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-30 blur-[2px]"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(207,47,99,0.35),transparent_45%),radial-gradient(circle_at_90%_20%,rgba(78,16,39,0.55),transparent_55%),linear-gradient(180deg,rgba(10,6,16,0.55),rgba(10,6,16,0.96))]" />
      <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-72 w-72 rounded-full bg-wine-600/25 blur-3xl" />

      <div className="relative flex min-h-[78vh] flex-col justify-center gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
        <span className="eyebrow inline-flex w-fit animate-fade-down rounded-full border border-wine-500/30 bg-wine-600/10 px-4 py-2">
          City life · nightlife · culture
        </span>

        <h1 className="max-w-4xl animate-fade-up font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Traieste fiecare seara <span className="text-gradient">la maxim</span>.
        </h1>

        <p
          className="max-w-2xl animate-fade-up text-lg text-slate-300 sm:text-xl"
          style={{ animationDelay: "0.08s" }}
        >
          Descopera concerte, party-uri si experiente culturale din orasul tau. Bilete intr-un singur loc, intr-un univers vizual curat si premium.
        </p>

        <div
          className="flex animate-fade-up flex-wrap items-center gap-3"
          style={{ animationDelay: "0.16s" }}
        >
          <Link to="/events" className="btn-primary px-7 py-3.5 text-base">
            Exploreaza evenimentele
          </Link>
          <Link to="/search" className="btn-outline px-7 py-3.5 text-base">
            Cauta rapid
          </Link>
        </div>

        <div
          className="mt-4 flex animate-fade-up flex-wrap gap-x-12 gap-y-4 border-t border-white/10 pt-8"
          style={{ animationDelay: "0.24s" }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
