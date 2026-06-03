import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectCurrentUserTickets } from "../features/tickets/ticketSelectors";
import { fetchMyTickets, type TicketItem } from "../features/tickets/ticketsSlice";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function MyTickets() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector(selectCurrentUserTickets);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    void dispatch(fetchMyTickets());
  }, [dispatch]);

  const handleDownloadInvoice = async (ticket: TicketItem) => {
    try {
      setInvoiceError(null);
      setDownloadingInvoice(true);

      const response = await api.get(`/Tickets/${ticket.id}/invoice`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: response.headers["content-type"] ?? "text/html" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${ticket.invoiceNumber}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setInvoiceError("Factura nu a putut fi descarcata.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative animate-fade-up overflow-hidden rounded-4xl border border-white/10 bg-ink-850/60 p-6 shadow-card sm:rounded-5xl sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(207,47,99,0.22),transparent_50%)]" />
        <div className="relative">
          <p className="eyebrow">Client area</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-white">Biletele mele</h1>
          <p className="mt-3 text-slate-300">
            Biletele cumparate apar aici. Apasa pe un bilet ca sa vezi codul QR si factura.
          </p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="card p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Inca nu ai bilete</h2>
          <p className="mt-3 text-slate-400">Intra in lista de evenimente si cumpara primul tau bilet.</p>
          <Link to="/events" className="btn-primary mt-6">Vezi evenimentele</Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {tickets.map((ticket, index) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => {
                setInvoiceError(null);
                setSelectedTicket(ticket);
              }}
              className="card card-hover animate-fade-up p-6 text-left"
              style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-wine-300/80">Confirmed ticket</p>
                  <h2 className="font-display text-2xl font-bold text-white">{ticket.eventTitle}</h2>
                  <p className="font-medium text-wine-300">{ticket.ticketTypeName}</p>
                  <p className="text-slate-400">{ticket.eventCity}, {ticket.venueName}</p>
                  <p className="text-slate-400">Eveniment: {formatDate(ticket.eventDate)}</p>
                </div>
                <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:min-w-72">
                  <div className="flex items-center justify-between text-sm text-slate-400"><span>Cantitate</span><span className="text-white">{ticket.quantity}</span></div>
                  <div className="flex items-center justify-between text-sm text-slate-400"><span>Pret total</span><span className="text-white">{ticket.totalPrice} lei</span></div>
                  <div className="flex items-center justify-between text-sm text-slate-400"><span>Cumparat la</span><span className="text-white">{formatDate(ticket.purchasedAt)}</span></div>
                  <div className="rounded-full bg-wine-600/15 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-wine-300">
                    Vezi QR si factura
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl animate-scale-in overflow-y-auto rounded-4xl border border-white/10 bg-ink-850 p-6 shadow-elevated sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="eyebrow">Bilet activ</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-white">{selectedTicket.eventTitle}</h2>
                <p className="mt-2 text-slate-400">{selectedTicket.eventCity}, {selectedTicket.venueName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="btn-outline"
              >
                Inchide
              </button>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <img
                  src={selectedTicket.qrCodeUrl}
                  alt={`QR pentru ${selectedTicket.eventTitle}`}
                  className="mx-auto h-64 w-64 rounded-2xl bg-white p-3 shadow-soft"
                />
                <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-slate-500">Cod bilet</p>
                <p className="mt-2 break-all text-center text-sm font-bold text-white">{selectedTicket.ticketCode}</p>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="eyebrow">Detalii acces</p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-400">
                    <div className="flex items-center justify-between gap-4"><span>Tip bilet</span><strong className="text-white">{selectedTicket.ticketTypeName}</strong></div>
                    <div className="flex items-center justify-between gap-4"><span>Cantitate</span><strong className="text-white">{selectedTicket.quantity}</strong></div>
                    <div className="flex items-center justify-between gap-4"><span>Data eveniment</span><strong className="text-white">{formatDate(selectedTicket.eventDate)}</strong></div>
                    <div className="flex items-center justify-between gap-4"><span>Total</span><strong className="text-white">{selectedTicket.totalPrice} lei</strong></div>
                    {selectedTicket.discountCode ? (
                      <div className="flex items-center justify-between gap-4"><span>Cod reducere</span><strong className="text-emerald-300">{selectedTicket.discountCode}</strong></div>
                    ) : null}
                    <div className="flex items-center justify-between gap-4"><span>Factura</span><strong className="text-white">{selectedTicket.invoiceNumber}</strong></div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="eyebrow">Actiuni</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleDownloadInvoice(selectedTicket)}
                      disabled={downloadingInvoice}
                      className="btn-primary"
                    >
                      {downloadingInvoice ? "Se descarca..." : "Descarca factura"}
                    </button>
                    <a
                      href={selectedTicket.qrCodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline"
                    >
                      Deschide QR mare
                    </a>
                  </div>
                  {invoiceError ? <p className="mt-4 text-sm text-rose-400">{invoiceError}</p> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
