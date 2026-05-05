import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectCurrentUser } from "../features/auth/authSelectors";
import { selectAllEvents } from "../features/events/eventSelectors";
import { fetchEventById } from "../features/events/eventsSlice";
import { purchaseTicket } from "../features/tickets/ticketsSlice";

const formatDate = (value: string) => new Date(value).toLocaleDateString("ro-RO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const primaryButtonClass = "rounded-full bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95";

export default function EventDetails() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const eventsStatus = useAppSelector((state) => state.events.status);
  const event = useAppSelector((state) => selectAllEvents(state).find((item) => item.id === id));

  useEffect(() => { if (id) { void dispatch(fetchEventById(id)); } }, [dispatch, id]);

  const ticketOptions = event?.ticketTypes?.length ? event.ticketTypes : [{ id: "default", name: "General Access", price: event?.ticketPrice ?? 49 }];
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(ticketOptions[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => { setSelectedTicketTypeId(ticketOptions[0]?.id ?? ""); }, [event?.id, ticketOptions]);

  const selectedTicketType = ticketOptions.find((ticketType) => ticketType.id === selectedTicketTypeId) ?? ticketOptions[0];
  const totalPrice = useMemo(() => quantity * (selectedTicketType?.price ?? event?.ticketPrice ?? 49), [event?.ticketPrice, quantity, selectedTicketType?.price]);

  if (!event && eventsStatus === "loading") return <div className="rounded-[2rem] bg-white p-8 shadow">Se incarca evenimentul...</div>;

  if (!event) {
    return <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_48px_rgba(15,23,42,0.08)]"><h1 className="text-3xl font-bold text-slate-950">Eveniment indisponibil</h1><p className="mt-3 text-slate-600">Evenimentul cautat nu exista sau nu este publicat.</p><Link to="/events" className={`mt-6 inline-flex ${primaryButtonClass}`}>Inapoi la evenimente</Link></div>;
  }

  const handleBuyTickets = async () => {
    if (!currentUser || currentUser.role !== "client") return;
    setSuccessMessage(""); setErrorMessage("");
    try {
      await dispatch(purchaseTicket({ eventId: event.id, userId: currentUser.id, eventTitle: event.title, eventDate: event.date, eventCity: event.city, venueName: event.venueName, ticketTypeName: selectedTicketType?.name ?? "General Access", quantity, unitPrice: selectedTicketType?.price ?? event.ticketPrice ?? 49 })).unwrap();
      setSuccessMessage("Biletele au fost adaugate in contul tau.");
    } catch (error) {
      setErrorMessage(typeof error === "string" ? error : "Nu am putut finaliza comanda.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="h-[360px] bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }} />
        <div className="grid gap-8 p-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm"><span className="rounded-full bg-violet-50 px-4 py-2 font-semibold text-violet-700">{event.category}</span><span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">{event.city}</span></div>
            <div><h1 className="text-4xl font-black text-slate-950">{event.title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{event.description}</p></div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs uppercase tracking-[0.25em] text-slate-400">Data</p><p className="mt-3 text-lg font-bold text-slate-950">{formatDate(event.date)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs uppercase tracking-[0.25em] text-slate-400">Locatie</p><p className="mt-3 text-lg font-bold text-slate-950">{event.venueName}</p><p className="mt-1 text-slate-600">{event.venueAddress}</p></div>
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs uppercase tracking-[0.25em] text-slate-400">Artists</p><div className="mt-3 space-y-2">{(event.performers ?? ["Lineup to be announced"]).map((performer) => (<p key={performer} className="text-sm font-semibold text-slate-950">{performer}</p>))}</div></div>
            </div>
          </div>
          <aside className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-lg shadow-slate-200">
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">Tickets</p>
            <p className="mt-3 text-4xl font-black text-white">{selectedTicketType?.price ?? event.ticketPrice ?? 49} lei</p>
            <p className="mt-2 text-white/62">Alege tipul de bilet dorit, apoi cantitatea.</p>
            <div className="mt-6 space-y-4"><label className="block text-sm font-semibold text-white/80">Tip bilet</label><select value={selectedTicketTypeId} onChange={(e) => setSelectedTicketTypeId(e.target.value)} className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none">{ticketOptions.map((ticketType) => (<option key={ticketType.id} value={ticketType.id} className="text-slate-950">{ticketType.name} - {ticketType.price} lei</option>))}</select></div>
            <div className="mt-4 space-y-4"><label className="block text-sm font-semibold text-white/80">Cantitate</label><select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none">{[1,2,3,4,5].map((value) => (<option key={value} value={value} className="text-slate-950">{value} bilet{value > 1 ? "e" : ""}</option>))}</select></div>
            <div className="mt-6 rounded-2xl bg-white/5 p-5"><div className="flex items-center justify-between text-sm text-white/65"><span>{selectedTicketType?.name ?? "General Access"}</span><span>{selectedTicketType?.price ?? event.ticketPrice ?? 49} lei</span></div><div className="mt-3 flex items-center justify-between text-sm font-semibold text-white"><span>Total</span><span>{totalPrice} lei</span></div></div>
            {currentUser?.role === "client" ? (<button onClick={handleBuyTickets} className={`mt-6 w-full ${primaryButtonClass}`}>Cumpara bilete</button>) : (<div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Pentru a cumpara bilete, autentifica-te ca utilizator de tip client.</div>)}
            {successMessage ? <p className="mt-4 text-sm font-medium text-emerald-300">{successMessage}</p> : null}
            {errorMessage ? <p className="mt-4 text-sm font-medium text-red-300">{errorMessage}</p> : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
