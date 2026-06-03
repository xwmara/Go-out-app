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
      <section className="card relative animate-fade-up overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(207,47,99,0.18),transparent_50%)]" />
        <div className="relative">
          <p className="eyebrow">Marketing</p>
          <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-extrabold text-white">Clienti</h1>
              <p className="mt-2 font-display text-3xl font-extrabold text-slate-500">{customers.length}</p>
              <p className="mt-3 max-w-3xl text-slate-400">
                Baza de clienti care au cumparat bilete la evenimentele tale. Poti cauta, filtra pe eveniment si exporta lista pentru campanii.
              </p>
            </div>
            <Link to="/organizer/events/create" className="btn-primary">
              Creeaza eveniment
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { label: "Clienti unici", value: String(customers.length) },
          { label: "Bilete cumparate", value: String(totalTickets) },
          { label: "Cheltuiala totala", value: formatCurrency(totalSpent) },
        ].map((stat, index) => (
          <article key={stat.label} className="card animate-fade-up p-6" style={{ animationDelay: `${index * 0.06}s` }}>
            <p className="eyebrow">{stat.label}</p>
            <p className="mt-3 font-display text-4xl font-extrabold text-white">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="card p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-wine-400/70">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cauta client... (Nume, email, eveniment)"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-500"
            />
            <span className="text-slate-400"><SearchIcon /></span>
          </label>

          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="input font-semibold"
          >
            <option value="all" className="bg-ink-800">Toate evenimentele</option>
            {events.map((event) => (
              <option key={event.id} value={event.id} className="bg-ink-800">{event.title}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid overflow-hidden rounded-2xl border border-white/10 md:grid-cols-2">
          <button type="button" className="border-b border-white/10 px-5 py-4 text-lg font-bold text-slate-200 md:border-b-0 md:border-r">
            Filtreaza
          </button>
          <button type="button" onClick={exportCustomers} className="px-5 py-4 text-lg font-bold text-slate-200 transition hover:bg-white/5">
            Export
          </button>
        </div>

        <div className="mt-6">
          <div className="hidden grid-cols-[1.4fr_120px_160px_120px_150px] px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 md:grid">
            <span>Nume</span>
            <span>Nr.Bilete</span>
            <span>Cheltuiala totala</span>
            <span>Contact</span>
            <span>Comenzi</span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 px-5 py-8 text-slate-400">Se incarca baza de clienti...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 px-5 py-8 text-slate-400">
              Nu exista clienti pentru filtrul selectat. Cumparaturile apar aici dupa ce clientii cumpara bilete.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <article key={customer.id} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-white/20">
                  <div className="grid items-center gap-3 md:grid-cols-[1.4fr_120px_160px_120px_150px]">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 shrink-0 rounded-full bg-wine-500" />
                      <div>
                        <p className="font-bold text-white">{customer.name}</p>
                        <p className="text-sm text-slate-400">{customer.email}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-200">{customer.tickets}</span>
                    <span className="font-bold text-slate-200">{formatCurrency(customer.spent)}</span>
                    <a href={`mailto:${customer.email}`} className="text-slate-400 transition hover:text-wine-300" aria-label={`Trimite email catre ${customer.name}`}>
                      <MailIcon />
                    </a>
                    <button
                      type="button"
                      onClick={() => setExpandedCustomerId(expandedCustomerId === customer.id ? null : customer.id)}
                      className="text-left font-bold text-wine-300 transition hover:text-white"
                    >
                      Vezi comenzi
                    </button>
                  </div>

                  {expandedCustomerId === customer.id ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-900/50 p-4">
                      {customer.orders.map((order) => (
                        <div key={order.ticketId} className="grid gap-2 border-b border-white/10 py-3 text-sm text-slate-300 last:border-b-0 md:grid-cols-[1fr_120px_120px_160px]">
                          <span className="font-semibold text-white">{order.ticketTypeName}</span>
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
        <article className="card p-6">
          <p className="eyebrow">Acoperire</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Evenimente si orase active</h2>
          <p className="mt-3 text-slate-400">Ai {publishedEvents.length} evenimente publicate in {visibleCities} orase.</p>
        </article>
        <article className="card p-6">
          <p className="eyebrow">Urmatorul pas</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Campanii si notificari</h2>
          <p className="mt-3 text-slate-400">Clientii din tabel pot fi folositi pentru invitatii, notificari si exporturi pentru campanii.</p>
        </article>
      </section>
    </div>
  );
}
