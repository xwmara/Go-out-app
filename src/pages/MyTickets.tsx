import { Link } from "react-router-dom";
import { useAppSelector } from "../app/store/hook";
import { selectCurrentUserTickets } from "../features/tickets/ticketSelectors";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const primaryButtonClass =
  "inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95";

export default function MyTickets() {
  const tickets = useAppSelector(selectCurrentUserTickets);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
          Client area
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Biletele mele</h1>
        <p className="mt-3 text-slate-600">
          Toate biletele cumparate apar aici, intr-o prezentare curata si usor de
          urmarit.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-bold text-slate-950">Inca nu ai bilete</h2>
          <p className="mt-3 text-slate-600">
            Intra in lista de evenimente si cumpara primul tau bilet.
          </p>
          <Link to="/events" className={`mt-6 ${primaryButtonClass}`}>
            Vezi evenimentele
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-violet-600">
                    Confirmed ticket
                  </p>
                  <h2 className="text-2xl font-bold text-slate-950">
                    {ticket.eventTitle}
                  </h2>
                  <p className="font-medium text-violet-700">{ticket.ticketTypeName}</p>
                  <p className="text-slate-600">
                    {ticket.eventCity}, {ticket.venueName}
                  </p>
                  <p className="text-slate-600">
                    Eveniment: {formatDate(ticket.eventDate)}
                  </p>
                </div>

                <div className="grid gap-4 rounded-2xl bg-slate-50 p-5 md:min-w-72">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Cantitate</span>
                    <span>{ticket.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Pret total</span>
                    <span>{ticket.totalPrice} lei</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Cumparat la</span>
                    <span>{formatDate(ticket.purchasedAt)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
