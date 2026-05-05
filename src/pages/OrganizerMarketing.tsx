import { Link } from "react-router-dom";
import { useAppSelector } from "../app/store/hook";
import { selectOrganizerEvents } from "../features/events/eventSelectors";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(value);

export default function OrganizerMarketing() {
  const events = useAppSelector(selectOrganizerEvents);

  const publishedEvents = events.filter((event) => event.status === "published");
  const visibleCities = new Set(publishedEvents.map((event) => event.city)).size;
  const startingRevenue = publishedEvents.reduce(
    (total, event) => total + (event.ticketPrice ?? 0) * Math.max(0, (event.availableTickets ?? 0) > 0 ? 1 : 0),
    0,
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Marketing</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Relatia cu publicul tau</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Aici vom lega baza de clienti, invitatiile, notificarile si exporturile. Pentru etapa asta,
          pagina este pusa pe structura buna si foloseste datele evenimentelor deja publicate.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Evenimente publicate</p>
          <p className="mt-3 text-4xl font-black text-slate-950">{publishedEvents.length}</p>
        </article>
        <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Orase active</p>
          <p className="mt-3 text-4xl font-black text-slate-950">{visibleCities}</p>
        </article>
        <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Revenue de start</p>
          <p className="mt-3 text-4xl font-black text-slate-950">{formatCurrency(startingRevenue)}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Ce urmeaza aici</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Feature-uri de marketing pregatite pentru etapa a doua</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              "Baza de clienti care au cumparat bilete",
              "Invitatii trimise catre public",
              "Notificari push pentru campanii",
              "Export pentru promovare si rapoarte",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Actiune rapida</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Vrei sa pui rapid un eveniment nou?</h2>
          <p className="mt-3 text-slate-600">
            Structura organizer este pregatita. Poti continua direct cu publicarea si editarea evenimentelor,
            iar aici vom conecta dupa aceea baza de clienti si campaniile.
          </p>
          <Link
            to="/organizer/events/create"
            className="mt-6 inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
          >
            Creeaza eveniment
          </Link>
        </article>
      </section>
    </div>
  );
}
