import { Link } from "react-router-dom";
import Reveal from "../common/Reveal";

/**
 * Closing call-to-action band with a premium gradient surface.
 */
export default function CtaSection() {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-4xl border border-wine-500/20 bg-brand-gradient-soft px-6 py-14 text-center shadow-glow sm:rounded-5xl sm:px-12 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-2xl space-y-6">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Gata de urmatoarea iesire?
          </h2>
          <p className="text-lg text-white/85">
            Creeaza-ti cont, descopera evenimente sau publica-ti propriul eveniment ca organizer — totul intr-un singur loc.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="btn inline-flex bg-white px-7 py-3.5 text-base text-ink-950 hover:bg-white/90"
            >
              Creeaza cont
            </Link>
            <Link
              to="/events"
              className="btn inline-flex border border-white/40 px-7 py-3.5 text-base text-white hover:bg-white/10"
            >
              Vezi evenimentele
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
