import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectOrganizerEvents } from "../features/events/eventSelectors";
import { fetchOrganizerEvents } from "../features/events/eventsSlice";
import { eventsService } from "../features/events/eventsService";
import type { OrganizerEventOrderItem } from "../features/events/eventTypes";

interface MarketingCustomer {
  id: string;
  name: string;
  email: string;
  tickets: number;
  spent: number;
  orders: OrganizerEventOrderItem[];
  events: string[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(value);

const csvEscape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const content = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function OrganizerMarketing() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectOrganizerEvents);
  const [customers, setCustomers] = useState<MarketingCustomer[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchOrganizerEvents());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      setLoading(true);
      const sourceEvents = selectedEventId === "all" ? events : events.filter((event) => event.id === selectedEventId);
      const customerMap = new Map<string, MarketingCustomer>();

      try {
        const overviews = await Promise.all(
          sourceEvents.map(async (event) => {
            try {
              return await eventsService.getOrganizerOverview(event.id);
            } catch {
              return null;
            }
          }),
        );

        overviews.filter(Boolean).forEach((overview) => {
          overview?.recentOrders.forEach((order) => {
            const key = order.customerEmail.toLowerCase();
            const existing = customerMap.get(key);

            if (existing) {
              existing.tickets += order.quantity;
              existing.spent += order.totalPrice;
              existing.orders.push(order);
              if (!existing.events.includes(overview.event.title)) {
                existing.events.push(overview.event.title);
              }
            } else {
              customerMap.set(key, {
                id: key,
                name: order.customerName,
                email: order.customerEmail,
                tickets: order.quantity,
                spent: order.totalPrice,
                orders: [order],
                events: [overview.event.title],
              });
            }
          });
        });

        if (isMounted) {
          setCustomers([...customerMap.values()].sort((left, right) => right.spent - left.spent));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCustomers();

    return () => {
      isMounted = false;
    };
  }, [events, selectedEventId]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.email, ...customer.events].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [customers, query]);

  const publishedEvents = events.filter((event) => event.status === "published");
  const visibleCities = new Set(publishedEvents.map((event) => event.city)).size;
  const totalSpent = customers.reduce((total, customer) => total + customer.spent, 0);
  const totalTickets = customers.reduce((total, customer) => total + customer.tickets, 0);

  const exportCustomers = () => {
    downloadCsv("marketing-clienti.csv", [
      ["Nume", "Email", "Nr. bilete", "Cheltuiala totala", "Evenimente"],
      ...filteredCustomers.map((customer) => [
        customer.name,
        customer.email,
        customer.tickets,
        customer.spent,
        customer.events.join("; "),
      ]),
    ]);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Marketing</p>
        <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-950">Clienti</h1>
            <p className="mt-2 text-3xl font-black text-slate-400">{customers.length}</p>
            <p className="mt-3 max-w-3xl text-slate-600">
              Baza de clienti care au cumparat bilete la evenimentele tale. Poti cauta, filtra pe eveniment si exporta lista pentru campanii.
            </p>
          </div>
          <Link
            to="/organizer/events/create"
            className="inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
          >
            Creeaza eveniment
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Clienti unici</p>
          <p className="mt-3 text-4xl font-black text-slate-950">{customers.length}</p>
        </article>
        <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Bilete cumparate</p>
          <p className="mt-3 text-4xl font-black text-slate-950">{totalTickets}</p>
        </article>
        <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Cheltuiala totala</p>
          <p className="mt-3 text-4xl font-black text-slate-950">{formatCurrency(totalSpent)}</p>
        </article>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cauta client... (Nume, email, eveniment)"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
            <SearchIcon />
          </label>

          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 outline-none focus:border-violet-400"
          >
            <option value="all">Toate evenimentele</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid overflow-hidden rounded-2xl border border-slate-200 md:grid-cols-2">
          <button type="button" className="border-b border-slate-200 px-5 py-4 text-xl font-black text-slate-800 md:border-b-0 md:border-r">
            Filtreaza
          </button>
          <button type="button" onClick={exportCustomers} className="px-5 py-4 text-xl font-black text-slate-800 hover:bg-slate-50">
            Export
          </button>
        </div>

        <div className="mt-6 overflow-hidden">
          <div className="grid grid-cols-[1.4fr_120px_160px_120px_150px] px-5 py-3 text-sm font-black text-slate-500">
            <span>Nume</span>
            <span>Nr.Bilete</span>
            <span>Cheltuiala totala</span>
            <span>Contact</span>
            <span>Comenzi</span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 px-5 py-8 text-slate-500">Se incarca baza de clienti...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 px-5 py-8 text-slate-500">
              Nu exista clienti pentru filtrul selectat. Cumparaturile apar aici dupa ce clientii cumpara bilete.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <article key={customer.id} className="rounded-[1.5rem] border border-slate-200 px-5 py-4">
                  <div className="grid items-center gap-3 md:grid-cols-[1.4fr_120px_160px_120px_150px]">
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded-full bg-violet-600" />
                      <div>
                        <p className="font-black text-slate-950">{customer.name}</p>
                        <p className="text-sm text-slate-500">{customer.email}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-800">{customer.tickets}</span>
                    <span className="font-black text-slate-800">{formatCurrency(customer.spent)}</span>
                    <a href={`mailto:${customer.email}`} className="text-slate-700 hover:text-violet-700" aria-label={`Trimite email catre ${customer.name}`}>
                      <MailIcon />
                    </a>
                    <button
                      type="button"
                      onClick={() => setExpandedCustomerId(expandedCustomerId === customer.id ? null : customer.id)}
                      className="text-left font-black text-violet-700 hover:text-violet-900"
                    >
                      Vezi comenzi
                    </button>
                  </div>

                  {expandedCustomerId === customer.id ? (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      {customer.orders.map((order) => (
                        <div key={order.ticketId} className="grid gap-2 border-b border-slate-200 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_120px_120px_160px]">
                          <span className="font-semibold text-slate-800">{order.ticketTypeName}</span>
                          <span>{order.quantity} bilete</span>
                          <span>{formatCurrency(order.totalPrice)}</span>
                          <span className="text-slate-500">{new Date(order.purchasedAt).toLocaleDateString("ro-RO")}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Acoperire</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Evenimente si orase active</h2>
          <p className="mt-3 text-slate-600">Ai {publishedEvents.length} evenimente publicate in {visibleCities} orase.</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Urmatorul pas</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Campanii si notificari</h2>
          <p className="mt-3 text-slate-600">Clientii din tabel pot fi folositi pentru invitatii, notificari si exporturi pentru campanii.</p>
        </article>
      </section>
    </div>
  );
}
