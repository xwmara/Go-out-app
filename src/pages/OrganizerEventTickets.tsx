import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectAllEvents } from "../features/events/eventSelectors";
import { fetchEventById, updateEvent } from "../features/events/eventsSlice";
import type { EventTicketType } from "../features/events/eventTypes";
import { discountsService, type DiscountItem } from "../features/discounts/discountsService";

type TicketDraft = EventTicketType & {
  remaining: number;
  soldOut: boolean;
  startsAt: string;
  endsAt: string;
};

const formatDateTime = (value: string) => {
  if (!value) return "Nesetat";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDatetimeLocal = (dateValue?: string) => {
  const date = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const emptyTicket = (eventDate?: string): TicketDraft => ({
  id: crypto.randomUUID(),
  name: "",
  price: 0,
  remaining: 100,
  soldOut: false,
  startsAt: toDatetimeLocal(new Date().toISOString()),
  endsAt: toDatetimeLocal(eventDate),
});

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function OrganizerEventTickets() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const event = useAppSelector((state) => selectAllEvents(state).find((item) => item.id === id));
  const [tickets, setTickets] = useState<TicketDraft[]>([]);
  const [editingTicket, setEditingTicket] = useState<TicketDraft | null>(null);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      void dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!id) return;
    let active = true;

    discountsService
      .listForEvent(id)
      .then((items) => {
        if (active) setDiscounts(items);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!event) return;

    const nextTickets = event.ticketTypes?.length
      ? event.ticketTypes.map((ticketType) => ({
          ...ticketType,
          remaining: ticketType.availableQuantity ?? event.availableTickets ?? 100,
          soldOut: ticketType.soldOut ?? false,
          startsAt: toDatetimeLocal(new Date().toISOString()),
          endsAt: toDatetimeLocal(event.date),
        }))
      : event.ticketPrice
        ? [{ ...emptyTicket(event.date), name: "General Access", price: event.ticketPrice }]
        : [emptyTicket(event.date)];

    setTickets(nextTickets);
  }, [event]);

  const totalRemaining = useMemo(
    () => tickets.reduce((sum, ticket) => sum + (ticket.soldOut ? 0 : ticket.remaining), 0),
    [tickets],
  );

  const persistTickets = async (nextTickets: TicketDraft[]) => {
    if (!event || !id) return;

    setSaving(true);
    setMessage("");

    try {
      await dispatch(
        updateEvent({
          id,
          data: {
            ticketTypes: nextTickets.map((ticket) => ({
              id: ticket.id,
              name: ticket.name,
              price: ticket.price,
              availableQuantity: ticket.remaining,
              description: ticket.description ?? "",
              soldOut: ticket.soldOut,
            })),
            ticketPrice: nextTickets[0]?.price ?? event.ticketPrice,
            availableTickets: nextTickets.reduce((sum, ticket) => sum + (ticket.soldOut ? 0 : ticket.remaining), 0),
          },
        }),
      ).unwrap();
      setMessage("Modificarile au fost salvate.");
    } catch {
      setMessage("Nu am putut salva modificarile.");
    } finally {
      setSaving(false);
    }
  };

  const saveTicket = async () => {
    if (!editingTicket) return;

    const normalizedTicket = {
      ...editingTicket,
      name: editingTicket.name.trim(),
      price: Number(editingTicket.price),
      remaining: Math.max(0, Number(editingTicket.remaining)),
    };

    if (!normalizedTicket.name || normalizedTicket.price <= 0) {
      setMessage("Completeaza numele biletului si un pret mai mare decat 0.");
      return;
    }

    const exists = tickets.some((ticket) => ticket.id === normalizedTicket.id);
    const nextTickets = exists
      ? tickets.map((ticket) => (ticket.id === normalizedTicket.id ? normalizedTicket : ticket))
      : [...tickets, normalizedTicket];

    setTickets(nextTickets);
    setEditingTicket(null);
    await persistTickets(nextTickets);
  };

  const deleteTicket = async (ticketId: string) => {
    if (tickets.length === 1) {
      setMessage("Trebuie sa ramana cel putin un tip de bilet.");
      return;
    }

    const nextTickets = tickets.filter((ticket) => ticket.id !== ticketId);
    setTickets(nextTickets);
    await persistTickets(nextTickets);
  };

  const toggleSoldOut = async (ticketId: string) => {
    const nextTickets = tickets.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, soldOut: !ticket.soldOut, remaining: ticket.soldOut ? 100 : 0 } : ticket,
    );

    setTickets(nextTickets);
    await persistTickets(nextTickets);
  };

  const addDiscount = async () => {
    if (!id) return;
    const code = discountCode.trim().toUpperCase();
    if (!code || discountPercent <= 0) {
      setMessage("Completeaza codul si procentul reducerii.");
      return;
    }

    try {
      const created = await discountsService.create({
        code,
        discountType: "percent",
        value: discountPercent,
        eventId: id,
        isActive: true,
      });
      setDiscounts((current) => [created, ...current]);
      setDiscountCode("");
      setDiscountPercent(10);
      setMessage("Codul de reducere a fost adaugat.");
    } catch {
      setMessage("Nu am putut adauga codul de reducere.");
    }
  };

  const removeDiscount = async (discountId: string) => {
    try {
      await discountsService.remove(discountId);
      setDiscounts((current) => current.filter((discount) => discount.id !== discountId));
      setMessage("Codul de reducere a fost sters.");
    } catch {
      setMessage("Nu am putut sterge codul de reducere.");
    }
  };

  if (!event) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white/75 shadow-[0_18px_48px_rgba(15,23,42,0.2)]">
        Se incarca biletele evenimentului...
      </div>
    );
  }

  return (
    <div className="relative space-y-8 overflow-hidden pb-10">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-black text-white">Bilete</h2>
          <p className="mt-2 text-2xl font-black text-white/90">{event.title}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <h3 className="text-3xl font-black text-white">Tipuri de bilete</h3>
            <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white/70">
              {totalRemaining} bilete ramase
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditingTicket(emptyTicket(event.date))}
          className="rounded-2xl bg-wine-600 px-6 py-3 text-lg font-black text-white shadow-glow transition hover:bg-wine-500"
        >
          + Adauga tip de bilet
        </button>
      </section>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-sm font-semibold text-white/80">
          {message}
        </div>
      ) : null}

      <section className="grid gap-7 xl:grid-cols-2">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="rounded-3xl border border-wine-600/60 bg-ink-900 p-5 shadow-card transition hover:border-wine-500">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h4 className="text-2xl font-black leading-tight text-white">{ticket.name || "Tip bilet fara nume"}</h4>
                <p className={`mt-3 inline-flex items-center gap-2 text-xl font-black ${ticket.soldOut ? "text-rose-300" : "text-emerald-400"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${ticket.soldOut ? "bg-rose-300" : "bg-emerald-400"}`} />
                  {ticket.soldOut ? "Sold out" : "Activ"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void deleteTicket(ticket.id)}
                className="rounded-xl p-2 text-white/85 transition hover:bg-white/10 hover:text-white"
                aria-label={`Sterge ${ticket.name}`}
              >
                <TrashIcon />
              </button>
            </div>

            <div className="my-5 border-t border-dashed border-white/35" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-lg font-black text-white/55">Pret</p>
                <p className="text-xl font-black text-white">{ticket.price} RON</p>
              </div>
              <div>
                <p className="text-lg font-black text-white/55">Cantitate ramasa</p>
                <p className="text-xl font-black text-white">{ticket.soldOut ? 0 : ticket.remaining}</p>
              </div>
              <div>
                <p className="text-lg font-black text-white/55">De la</p>
                <p className="text-lg font-black text-white">{formatDateTime(ticket.startsAt)}</p>
              </div>
              <div>
                <p className="text-lg font-black text-white/55">Pana la</p>
                <p className="text-lg font-black text-white">{formatDateTime(ticket.endsAt)}</p>
              </div>
            </div>

            <div className="my-5 border-t border-dashed border-white/25" />

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setEditingTicket(ticket)}
                className="rounded-full bg-wine-600 px-5 py-2.5 text-lg font-black text-white transition hover:bg-wine-500"
              >
                Editeaza
              </button>
              <button
                type="button"
                onClick={() => void toggleSoldOut(ticket.id)}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {ticket.soldOut ? "Reactiveaza" : "Sold out"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {editingTicket ? (
        <section className="animate-scale-in rounded-4xl border border-white/10 bg-ink-850 p-6 text-slate-100 shadow-elevated">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Editor bilet</p>
              <h3 className="mt-1 font-display text-2xl font-extrabold text-white">{tickets.some((ticket) => ticket.id === editingTicket.id) ? "Editeaza bilet" : "Adauga tip de bilet"}</h3>
            </div>
            <button type="button" onClick={() => setEditingTicket(null)} className="btn-outline">
              Inchide
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">Nume bilet</span>
              <input value={editingTicket.name} onChange={(e) => setEditingTicket({ ...editingTicket, name: e.target.value })} className="input" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">Pret</span>
              <input type="number" min="1" value={editingTicket.price || ""} onChange={(e) => setEditingTicket({ ...editingTicket, price: Number(e.target.value) })} className="input" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">Cantitate ramasa</span>
              <input type="number" min="0" value={editingTicket.remaining} onChange={(e) => setEditingTicket({ ...editingTicket, remaining: Number(e.target.value), soldOut: Number(e.target.value) <= 0 })} className="input" />
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <input type="checkbox" checked={editingTicket.soldOut} onChange={(e) => setEditingTicket({ ...editingTicket, soldOut: e.target.checked, remaining: e.target.checked ? 0 : editingTicket.remaining || 100 })} className="h-4 w-4 accent-wine-600" />
              <span className="text-sm font-semibold text-slate-300">Marcheaza sold out</span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">De la</span>
              <input type="datetime-local" value={editingTicket.startsAt} onChange={(e) => setEditingTicket({ ...editingTicket, startsAt: e.target.value })} className="input" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">Pana la</span>
              <input type="datetime-local" value={editingTicket.endsAt} onChange={(e) => setEditingTicket({ ...editingTicket, endsAt: e.target.value })} className="input" />
            </label>
          </div>

          <button type="button" disabled={saving} onClick={() => void saveTicket()} className="btn-primary mt-6 px-6 py-3">
            {saving ? "Se salveaza..." : "Salveaza bilet"}
          </button>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <h3 className="text-3xl font-black text-white">Coduri de reducere</h3>
          <div className="mt-5 space-y-3">
            {discounts.length === 0 ? (
              <p className="text-white/55">Nu ai adaugat inca niciun cod de reducere.</p>
            ) : (
              discounts.map((discount) => (
                <div key={discount.id} className="flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white">
                  <span className="font-black">{discount.code}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-wine-300">
                      {discount.discountType === "fixed" ? `-${discount.value} lei` : `-${discount.value}%`}
                    </span>
                    <button
                      type="button"
                      onClick={() => void removeDiscount(discount.id)}
                      className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-rose-300"
                      aria-label={`Sterge codul ${discount.code}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="Cod" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-semibold text-white outline-none placeholder:text-white/35 focus:border-wine-400" />
            <input type="number" min="1" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-semibold text-white outline-none focus:border-wine-400" />
          </div>
          <button type="button" onClick={() => void addDiscount()} className="mt-4 w-full rounded-2xl bg-wine-600 px-6 py-3 text-lg font-black text-white shadow-glow transition hover:bg-wine-500">
            + Adauga cod de reducere
          </button>
        </div>
      </section>
    </div>
  );
}
