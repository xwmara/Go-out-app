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

const primaryButtonClass =
  "inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95";

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
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Client area</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Biletele mele</h1>
        <p className="mt-3 text-slate-600">
          Biletele cumparate apar aici. Apasa pe un bilet ca sa vezi codul QR si factura.
        </p>
      </div>
      {tickets.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-bold text-slate-950">Inca nu ai bilete</h2>
          <p className="mt-3 text-slate-600">Intra in lista de evenimente si cumpara primul tau bilet.</p>
          <Link to="/events" className={`mt-6 ${primaryButtonClass}`}>Vezi evenimentele</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => {
                setInvoiceError(null);
                setSelectedTicket(ticket);
              }}
              className="rounded-[1.5rem] bg-white p-6 text-left shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-violet-600">Confirmed ticket</p>
                  <h2 className="text-2xl font-bold text-slate-950">{ticket.eventTitle}</h2>
                  <p className="font-medium text-violet-700">{ticket.ticketTypeName}</p>
                  <p className="text-slate-600">{ticket.eventCity}, {ticket.venueName}</p>
                  <p className="text-slate-600">Eveniment: {formatDate(ticket.eventDate)}</p>
                </div>
                <div className="grid gap-4 rounded-2xl bg-slate-50 p-5 md:min-w-72">
                  <div className="flex items-center justify-between text-sm text-slate-500"><span>Cantitate</span><span>{ticket.quantity}</span></div>
                  <div className="flex items-center justify-between text-sm text-slate-500"><span>Pret total</span><span>{ticket.totalPrice} lei</span></div>
                  <div className="flex items-center justify-between text-sm text-slate-500"><span>Cumparat la</span><span>{formatDate(ticket.purchasedAt)}</span></div>
                  <div className="rounded-full bg-violet-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                    Vezi QR si factura
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Bilet activ</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">{selectedTicket.eventTitle}</h2>
                <p className="mt-2 text-slate-600">{selectedTicket.eventCity}, {selectedTicket.venueName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Inchide
              </button>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <img
                  src={selectedTicket.qrCodeUrl}
                  alt={`QR pentru ${selectedTicket.eventTitle}`}
                  className="mx-auto h-64 w-64 rounded-2xl bg-white p-3 shadow-sm"
                />
                <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-slate-400">Cod bilet</p>
                <p className="mt-2 break-all text-center text-sm font-bold text-slate-950">{selectedTicket.ticketCode}</p>
              </div>

              <div className="space-y-5">
                <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Detalii acces</p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-4"><span>Tip bilet</span><strong className="text-slate-950">{selectedTicket.ticketTypeName}</strong></div>
                    <div className="flex items-center justify-between gap-4"><span>Cantitate</span><strong className="text-slate-950">{selectedTicket.quantity}</strong></div>
                    <div className="flex items-center justify-between gap-4"><span>Data eveniment</span><strong className="text-slate-950">{formatDate(selectedTicket.eventDate)}</strong></div>
                    <div className="flex items-center justify-between gap-4"><span>Total</span><strong className="text-slate-950">{selectedTicket.totalPrice} lei</strong></div>
                    <div className="flex items-center justify-between gap-4"><span>Factura</span><strong className="text-slate-950">{selectedTicket.invoiceNumber}</strong></div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Actiuni</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleDownloadInvoice(selectedTicket)}
                      disabled={downloadingInvoice}
                      className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {downloadingInvoice ? "Se descarca..." : "Descarca factura"}
                    </button>
                    <a
                      href={selectedTicket.qrCodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
                    >
                      Deschide QR mare
                    </a>
                  </div>
                  {invoiceError ? <p className="mt-4 text-sm text-red-500">{invoiceError}</p> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
