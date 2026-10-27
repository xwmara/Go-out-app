import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectAllEvents } from "../features/events/eventSelectors";
import { fetchEventById } from "../features/events/eventsSlice";
import { eventsService } from "../features/events/eventsService";
import type { OrganizerEventOverview } from "../features/events/eventTypes";

const currency = (value: number) => `${value.toFixed(2)} RON`;

const downloadFile = (filename: string, content: string, type = "text/csv;charset=utf-8") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const csvEscape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

function PurpleShape({ className }: { className: string }) {
  return <div className={`pointer-events-none absolute rounded-[45%] bg-wine-600 opacity-95 ${className}`} />;
}

export default function OrganizerEventFiscalization() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const event = useAppSelector((state) => selectAllEvents(state).find((item) => item.id === id));
  const [overview, setOverview] = useState<OrganizerEventOverview | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      void dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      if (!id) return;

      try {
        const data = await eventsService.getOrganizerOverview(id);
        if (isMounted) {
          setOverview(data);
        }
      } catch {
        if (isMounted) {
          setOverview(null);
        }
      }
    };

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const eventTitle = event?.title ?? overview?.event.title ?? "Eveniment";
  const eventDate = event?.date ?? overview?.event.date ?? "";
  const orders = overview?.recentOrders ?? [];
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalTickets = orders.reduce((sum, order) => sum + order.quantity, 0);

  const safeFilename = useMemo(
    () => eventTitle.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "eveniment",
    [eventTitle],
  );

  const downloadRegistration = () => {
    const ticketRows = event?.ticketTypes?.length
      ? event.ticketTypes.map((ticket) => [ticket.name, ticket.price, event.availableTickets ?? 0])
      : [["General Access", event?.ticketPrice ?? 0, event?.availableTickets ?? 0]];

    const rows = [
      ["Eveniment", eventTitle],
      ["Data eveniment", eventDate],
      ["Venue", event?.venueName ?? ""],
      ["Oras", event?.city ?? ""],
      [],
      ["Tip bilet", "Pret", "Cantitate disponibila"],
      ...ticketRows,
    ];

    downloadFile(
      `inregistrare-bilete-${safeFilename}.csv`,
      rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n"),
    );
    setMessage("Fisierul pentru inregistrarea biletelor a fost generat.");
  };

  const downloadSettlement = () => {
    const rows = [
      ["Eveniment", eventTitle],
      ["Data eveniment", eventDate],
      ["Total bilete vandute", totalTickets],
      ["Total incasari", currency(totalRevenue)],
      [],
      ["Client", "Email", "Tip bilet", "Cantitate", "Total", "Data cumparare"],
      ...orders.map((order) => [
        order.customerName,
        order.customerEmail,
        order.ticketTypeName,
        order.quantity,
        currency(order.totalPrice),
        order.purchasedAt,
      ]),
    ];

    downloadFile(
      `decont-plati-${safeFilename}.csv`,
      rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n"),
    );
    setMessage("Fisierul de decont si plati a fost generat.");
  };

  return (
    <div className="relative min-h-[calc(100vh-180px)] overflow-hidden pb-12">
      <PurpleShape className="left-[-180px] bottom-[-220px] h-[360px] w-[360px]" />
      <PurpleShape className="right-[-130px] bottom-[-180px] h-[330px] w-[250px]" />
      <PurpleShape className="left-[44%] top-[70px] h-[220px] w-[240px]" />

      <section className="relative z-10 max-w-[1420px] space-y-16">
        <div>
          <h2 className="text-5xl font-black tracking-tight text-white">Fiscalizare</h2>
          <p className="mt-2 text-2xl font-black text-white/90">{eventTitle}</p>
        </div>

        {message ? (
          <div className="max-w-3xl rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-sm font-semibold text-emerald-100">
            {message}
          </div>
        ) : null}

        <article className="grid gap-8 lg:grid-cols-[1fr_180px] lg:items-center">
          <div>
            <h3 className="text-3xl font-black text-white">Inregistrare bilete</h3>
            <p className="mt-2 max-w-5xl text-2xl font-semibold leading-snug text-white/58">
              Biletele pentru un eveniment se vor fiscaliza pana la data evenimentului, inclusiv. Actele se vor depune la Directia de Impozite si Taxe Locale de care apartine locatia desfasurarii evenimentului.
            </p>

            <ul className="mt-8 space-y-1 text-2xl font-black leading-tight text-white">
              <li>2x formular inregistrare bilete</li>
              <li>1x copie CUI (stampilata/semnata si scris in conformitate cu originalul)</li>
              <li>1x copie contract servicii de ticketing (stampilata / semnata si scris in conformitate cu originalul)</li>
              <li>1x copie Act constitutiv sau copie CI a administratorului</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={downloadRegistration}
            className="justify-self-start rounded-full bg-wine-600 px-7 py-3 text-xl font-black text-white shadow-glow transition hover:bg-wine-500 lg:justify-self-end"
          >
            Descarca
          </button>
        </article>

        <article className="grid gap-8 lg:grid-cols-[1fr_180px] lg:items-center">
          <div>
            <h3 className="text-3xl font-black text-white">Decont bilete</h3>
            <p className="mt-2 max-w-6xl text-2xl font-semibold leading-snug text-white/58">
              Operarea decontului si plata taxelor si impozitelor aferente spectacolelor rezultate din decont se face pana pe data de 10 a lunii urmatoare de dupa eveniment. Daca se intarzie peste data de 10, se platesc penalitati de 1% pe luna de intarziere. Pentru decont sunt necesare urmatoarele acte:
            </p>

            <ul className="mt-8 space-y-1 text-2xl font-black leading-tight text-white">
              <li>1x formular inregistrare bilete completat</li>
              <li>2 x formular de decont</li>
              <li>2 x cerere de casare a biletelor nevandute</li>
              <li>1x copie Act constitutiv sau copie CI a administratorului</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={downloadSettlement}
            className="justify-self-start rounded-full bg-wine-600 px-7 py-3 text-xl font-black text-white shadow-glow transition hover:bg-wine-500 lg:justify-self-end"
          >
            Descarca
          </button>
        </article>
      </section>
    </div>
  );
}
