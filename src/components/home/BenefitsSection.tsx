import Reveal from "../common/Reveal";

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4Z" />
      <path d="M14 5v14" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const benefits = [
  {
    icon: <TicketIcon />,
    title: "Bilete intr-un singur loc",
    description: "Cumperi rapid, primesti QR-ul instant si ai factura la indemana, fara batai de cap.",
  },
  {
    icon: <SparkIcon />,
    title: "Cele mai tari experiente",
    description: "Concerte, nightlife si evenimente culturale curate, alese pentru vibe-ul orasului tau.",
  },
  {
    icon: <ShieldIcon />,
    title: "Sigur si transparent",
    description: "Plati protejate si organizatori verificati, ca sa te bucuri linistit de eveniment.",
  },
];

/**
 * "Why us" value props — static brand copy presented in clean glass cards.
 */
export default function BenefitsSection() {
  return (
    <section className="space-y-8">
      <Reveal>
        <p className="eyebrow">De ce Go-Out App</p>
        <h2 className="mt-2 max-w-3xl font-display text-3xl font-extrabold text-white sm:text-4xl">
          Tot ce ai nevoie ca sa iesi in oras, fara compromisuri.
        </h2>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 90}>
            <article className="card card-hover h-full p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wine-600/15 text-wine-200">
                {benefit.icon}
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{benefit.title}</h3>
              <p className="mt-2 text-slate-400">{benefit.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
