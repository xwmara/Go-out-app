import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { eventsService } from "../features/events/eventsService";
import type {
  OrganizerEventOverview as OrganizerEventOverviewModel,
  OrganizerEventSalesPoint,
} from "../features/events/eventTypes";

const rangeOptions = [
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "ALL", label: "ALL" },
] as const;

type RangeKey = (typeof rangeOptions)[number]["key"];

const currency = (value: number) => `${value.toFixed(2)} lei`;

function SalesChart({ points, range }: { points: OrganizerEventSalesPoint[]; range: RangeKey }) {
  const width = 980;
  const height = 420;
  const padding = { top: 56, right: 40, bottom: 76, left: 58 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const bars = useMemo(() => {
    if (range === "1D") {
      const hourly = Array.from({ length: 24 }, (_, hour) => ({
        key: String(hour),
        label: `${String(hour).padStart(2, "0")}:00`,
        ticketsSold: 0,
        revenue: 0,
      }));

      points.forEach((point) => {
        const hour = new Date(point.bucketStart).getHours();
        hourly[hour].ticketsSold += point.ticketsSold;
        hourly[hour].revenue += point.revenue;
      });

      return hourly;
    }

    return points.map((point, index) => ({
      key: `${point.bucketStart}-${index}`,
      label: point.label,
      ticketsSold: point.ticketsSold,
      revenue: point.revenue,
    }));
  }, [points, range]);

  const maxTickets = Math.max(...bars.map((bar) => bar.ticketsSold), 1);
  const ySteps = Array.from({ length: maxTickets + 1 }, (_, index) => index);
  const gap = bars.length > 16 ? 10 : 18;
  const slotWidth = innerWidth / Math.max(bars.length, 1);
  const barWidth = Math.max(14, Math.min(30, slotWidth - gap));
  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const totalTickets = points.reduce((sum, point) => sum + point.ticketsSold, 0);

  return (
    <div className="relative py-3">
      <div className="mb-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-center">
        <div className="grid grid-cols-2 gap-10 rounded-[40%] bg-wine-600 px-9 py-7 shadow-[0_24px_70px_rgba(183,30,76,0.32)]">
          <div>
            <p className="text-xl font-black text-white/55">Bilete</p>
            <p className="mt-1 border-b-2 border-cyan-400 pb-1 text-2xl font-black text-white">{totalTickets}</p>
          </div>
          <div>
            <p className="text-xl font-black text-white/55">Incasari</p>
            <p className="mt-1 text-2xl font-black text-white">{currency(totalRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-transparent px-2 py-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[980px]" role="img" aria-label="Diagrama biletelor vandute pe intervale orare">
          {ySteps.map((step) => {
            const y = padding.top + innerHeight - (step / maxTickets) * innerHeight;
            return (
              <g key={step}>
                <line
                  x1={padding.left}
                  x2={padding.left + innerWidth}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.72)"
                  strokeDasharray="4 8"
                  strokeWidth={step === 0 ? 1.2 : 1}
                />
                <text x={padding.left - 12} y={y + 5} textAnchor="end" className="fill-white text-[15px] font-black">
                  {step}
                </text>
              </g>
            );
          })}

          {bars.map((bar, index) => {
            const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
            const barHeight = bar.ticketsSold > 0 ? Math.max(16, (bar.ticketsSold / maxTickets) * innerHeight) : 0;
            const y = padding.top + innerHeight - barHeight;
            const labelY = Math.max(padding.top + 14, y - 16);

            return (
              <g key={bar.key}>
                {bar.ticketsSold > 0 ? (
                  <>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="7"
                      fill="#27a8dc"
                    />
                    <text x={x + barWidth / 2} y={labelY} textAnchor="middle" className="fill-white text-[11px] font-black">
                      {currency(bar.revenue)}
                    </text>
                  </>
                ) : null}
                <text
                  x={x + barWidth / 2}
                  y={padding.top + innerHeight + 34}
                  textAnchor="end"
                  transform={`rotate(-24 ${x + barWidth / 2} ${padding.top + innerHeight + 34})`}
                  className="fill-white text-[14px] font-black"
                >
                  {bar.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function OrganizerEventOverview() {
  const { id } = useParams();
  const [overview, setOverview] = useState<OrganizerEventOverviewModel | null>(null);
  const [range, setRange] = useState<RangeKey>("1D");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await eventsService.getOrganizerOverview(id);
        if (isMounted) {
          setOverview(data);
        }
      } catch {
        if (isMounted) {
          setError("Nu am putut incarca overview-ul evenimentului.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const filteredTimeline = useMemo(() => {
    if (!overview) return [];
    if (range === "ALL") return overview.salesTimeline;

    const days = range === "1D" ? 1 : range === "1W" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return overview.salesTimeline.filter((point) => new Date(point.bucketStart).getTime() >= cutoff);
  }, [overview, range]);

  const filteredOrders = useMemo(() => {
    if (!overview) return [];
    if (range === "ALL") return overview.recentOrders;

    const days = range === "1D" ? 1 : range === "1W" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return overview.recentOrders.filter((order) => new Date(order.purchasedAt).getTime() >= cutoff);
  }, [overview, range]);

  if (loading) {
    return <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-8 text-white/80">Se incarca overview-ul evenimentului...</div>;
  }

  if (error || !overview) {
    return <div className="rounded-[1.75rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error ?? "Evenimentul nu a putut fi incarcat."}</div>;
  }

  const ticketBreakdown = overview.event.ticketTypes?.map((ticketType) => ({
    ...ticketType,
    sold: filteredOrders
      .filter((order) => order.ticketTypeName === ticketType.name)
      .reduce((sum, order) => sum + order.quantity, 0),
  })) ?? [];

  const summaryCards = [
    { label: "Evenimente", value: "1" },
    { label: "Bilete", value: String(overview.ticketsSold) },
    { label: "Venit", value: currency(overview.revenue) },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/45">Overview</p>
              <h2 className="mt-2 text-3xl font-black text-white">{overview.event.title}</h2>
              <p className="mt-2 text-white/65">Dashboard live pentru vanzari, comenzi si statusul general al evenimentului.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div>
                <p className="text-sm text-white/50">Bilete</p>
                <p className="text-2xl font-black text-wine-300">{overview.ticketsSold}</p>
              </div>
              <div>
                <p className="text-sm text-white/50">Incasari</p>
                <p className="text-2xl font-black text-white">{currency(overview.revenue)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {rangeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  range === option.key
                    ? "bg-white text-wine-700"
                    : "bg-white/8 text-white/75 hover:bg-white/12 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {filteredTimeline.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 text-center text-white/55">
              Nu exista vanzari in intervalul selectat.
            </div>
          ) : (
            <SalesChart points={filteredTimeline} range={range} />
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-center shadow-[0_18px_48px_rgba(15,23,42,0.2)]">
            <p className="text-lg font-bold text-white">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-white">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-white">Comenzi recente</h3>
              <p className="mt-1 text-white/55">Vezi clientii care au cumparat bilete la acest eveniment.</p>
            </div>
            <Link to="/organizer/marketing" className="btn-primary">
              Vezi comenzi
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="grid grid-cols-[1.1fr_1.2fr_120px_120px] bg-white/6 px-5 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              <span>Client</span>
              <span>Email</span>
              <span>Bilete</span>
              <span>Total</span>
            </div>
            {filteredOrders.length === 0 ? (
              <div className="px-5 py-8 text-sm text-white/55">Nu exista comenzi in perioada selectata.</div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.ticketId} className="grid grid-cols-[1.1fr_1.2fr_120px_120px] items-center border-t border-white/8 px-5 py-4 text-sm text-white/85">
                  <div>
                    <p className="font-semibold text-white">{order.customerName}</p>
                    <p className="text-xs text-white/45">{order.ticketTypeName}</p>
                  </div>
                  <span className="truncate text-white/65">{order.customerEmail}</span>
                  <span>{order.quantity}</span>
                  <span className="font-semibold">{currency(order.totalPrice)}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-white">Bilete</h3>
              <p className="mt-1 text-white/55">Status rapid pentru tipurile de bilete configurate.</p>
            </div>
            <Link to="../tickets" className="btn-primary">
              Vezi bilete
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {ticketBreakdown.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/3 px-5 py-8 text-sm text-white/55">
                Nu exista inca tipuri de bilete configurate pentru acest eveniment.
              </div>
            ) : (
              ticketBreakdown.map((ticketType) => (
                <div key={ticketType.id} className="rounded-[1.5rem] border border-white/10 bg-white/3 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-white">{ticketType.name}</p>
                      <p className="mt-1 text-sm text-white/55">Pret unitar: {currency(ticketType.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm uppercase tracking-[0.25em] text-white/35">Vandute</p>
                      <p className="mt-1 text-2xl font-black text-wine-300">{ticketType.sold}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}



