import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectCurrentUser } from "../features/auth/authSelectors";
import { selectAllEvents } from "../features/events/eventSelectors";
import { fetchEventById } from "../features/events/eventsSlice";
import { isTicketTypeSoldOut } from "../features/events/eventTypes";
import { purchaseTicket } from "../features/tickets/ticketsSlice";
import { discountsService, type ValidateDiscountResult } from "../features/discounts/discountsService";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

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

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<ValidateDiscountResult | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  useEffect(() => {
    const firstAvailable = ticketOptions.find((option) => !isTicketTypeSoldOut(option)) ?? ticketOptions[0];
    setSelectedTicketTypeId(firstAvailable?.id ?? "");
  }, [event?.id, ticketOptions]);

  const selectedTicketType = ticketOptions.find((ticketType) => ticketType.id === selectedTicketTypeId) ?? ticketOptions[0];
  const unitPrice = selectedTicketType?.price ?? event?.ticketPrice ?? 49;
  const subtotal = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);
  const selectedSoldOut = selectedTicketType ? isTicketTypeSoldOut(selectedTicketType) : false;
  const allSoldOut = ticketOptions.every((option) => isTicketTypeSoldOut(option));

  const discountAmount = appliedDiscount?.valid ? appliedDiscount.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const resetDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError("");
  };

  const handleTicketTypeChange = (value: string) => {
    setSelectedTicketTypeId(value);
    resetDiscount();
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    resetDiscount();
  };

  if (!event && eventsStatus === "loading") {
    return <div className="card animate-pulse p-8 text-slate-400">Se incarca evenimentul...</div>;
  }

  if (!event) {
    return (
      <div className="card p-8">
        <h1 className="font-display text-3xl font-bold text-white">Eveniment indisponibil</h1>
        <p className="mt-3 text-slate-400">Evenimentul cautat nu exista sau nu este publicat.</p>
        <Link to="/events" className="btn-primary mt-6">Inapoi la evenimente</Link>
      </div>
    );
  }

  const handleApplyDiscount = async () => {
    const code = discountInput.trim();
    if (!code) {
      setDiscountError("Introdu un cod de reducere.");
      setAppliedDiscount(null);
      return;
    }

    setApplyingDiscount(true);
    setDiscountError("");
    try {
      const result = await discountsService.validate(event.id, code, subtotal);
      if (result.valid) {
        setAppliedDiscount(result);
        setDiscountError("");
      } else {
        setAppliedDiscount(null);
        setDiscountError(result.message || "Codul de reducere nu este valid.");
      }
    } catch {
      setAppliedDiscount(null);
      setDiscountError("Nu am putut valida codul de reducere.");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleBuyTickets = async () => {
    if (!currentUser || currentUser.role !== "client") return;
    if (selectedSoldOut) {
      setErrorMessage("Acest tip de bilet este SOLD OUT.");
      return;
    }
    setSuccessMessage(""); setErrorMessage("");
    try {
      await dispatch(purchaseTicket({
        eventId: event.id,
        userId: currentUser.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventCity: event.city,
        venueName: event.venueName,
        ticketTypeId: selectedTicketType?.id,
        ticketTypeName: selectedTicketType?.name ?? "General Access",
        quantity,
        unitPrice,
        discountCode: appliedDiscount?.valid ? appliedDiscount.code ?? undefined : undefined,
      })).unwrap();
      setSuccessMessage("Biletele au fost adaugate in contul tau.");
    } catch (error) {
      setErrorMessage(typeof error === "string" ? error : "Nu am putut finaliza comanda.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="animate-fade-up overflow-hidden rounded-4xl border border-white/10 bg-ink-850/60 shadow-card sm:rounded-5xl">
        <div className="relative h-[300px] sm:h-[380px]">
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
        </div>
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-wine-600/15 px-4 py-2 font-semibold text-wine-300">{event.category}</span>
              <span className="rounded-full bg-white/5 px-4 py-2 font-semibold text-slate-300">{event.city}</span>
            </div>
            <div>
              <h1 className="font-display text-4xl font-extrabold text-white">{event.title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{event.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Data</p>
                <p className="mt-3 text-lg font-bold text-white">{formatDate(event.date)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Locatie</p>
                <p className="mt-3 text-lg font-bold text-white">{event.venueName}</p>
                <p className="mt-1 text-slate-400">{event.venueAddress}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Artists</p>
                <div className="mt-3 space-y-2">
                  {(event.performers ?? ["Lineup to be announced"]).map((performer) => (
                    <p key={performer} className="text-sm font-semibold text-white">{performer}</p>
                  ))}
                </div>
              </div>
            </div>

            {event.ticketTypes?.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="eyebrow">Tipuri de bilete</p>
                <div className="mt-4 space-y-3">
                  {event.ticketTypes.map((ticketType) => {
                    const soldOut = isTicketTypeSoldOut(ticketType);
                    return (
                      <div key={ticketType.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-ink-900/40 px-4 py-3">
                        <div>
                          <p className="font-semibold text-white">{ticketType.name}</p>
                          {ticketType.description ? <p className="mt-0.5 text-sm text-slate-400">{ticketType.description}</p> : null}
                          {ticketType.availableQuantity !== null && ticketType.availableQuantity !== undefined && !soldOut ? (
                            <p className="mt-0.5 text-xs text-slate-500">{ticketType.availableQuantity} bilete disponibile</p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{ticketType.price} lei</p>
                          {soldOut ? (
                            <span className="mt-1 inline-flex rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-rose-300">Sold out</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="rounded-4xl border border-white/10 bg-ink-900/80 p-6 shadow-soft">
            <p className="eyebrow">Tickets</p>
            <p className="mt-3 font-display text-4xl font-extrabold text-white">{unitPrice} lei</p>
            <p className="mt-2 text-slate-400">Alege tipul de bilet dorit, apoi cantitatea.</p>

            <div className="mt-6 space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Tip bilet</label>
              <select value={selectedTicketTypeId} onChange={(e) => handleTicketTypeChange(e.target.value)} className="input">
                {ticketOptions.map((ticketType) => {
                  const soldOut = isTicketTypeSoldOut(ticketType);
                  return (
                    <option key={ticketType.id} value={ticketType.id} disabled={soldOut} className="bg-ink-800 text-white">
                      {ticketType.name} - {ticketType.price} lei{soldOut ? " (SOLD OUT)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="mt-4 space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Cantitate</label>
              <select value={quantity} onChange={(e) => handleQuantityChange(Number(e.target.value))} className="input" disabled={selectedSoldOut}>
                {[1,2,3,4,5].map((value) => (
                  <option key={value} value={value} className="bg-ink-800 text-white">{value} bilet{value > 1 ? "e" : ""}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Cod de reducere</label>
              <div className="flex gap-2">
                <input
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="Ex: EARLYBIRD"
                  className="input flex-1"
                  disabled={selectedSoldOut}
                />
                <button
                  type="button"
                  onClick={() => void handleApplyDiscount()}
                  disabled={applyingDiscount || selectedSoldOut}
                  className="btn-outline shrink-0"
                >
                  {applyingDiscount ? "..." : "Aplica"}
                </button>
              </div>
              {appliedDiscount?.valid ? (
                <p className="text-sm font-medium text-emerald-300">
                  Cod {appliedDiscount.code} aplicat — reducere {discountAmount} lei.
                </p>
              ) : null}
              {discountError ? <p className="text-sm text-rose-400">{discountError}</p> : null}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-sm text-slate-400"><span>{selectedTicketType?.name ?? "General Access"}</span><span>{subtotal} lei</span></div>
              {discountAmount > 0 ? (
                <div className="mt-2 flex items-center justify-between text-sm text-emerald-300"><span>Reducere</span><span>- {discountAmount} lei</span></div>
              ) : null}
              <div className="mt-3 flex items-center justify-between text-sm font-semibold text-white"><span>Total</span><span className="text-gradient text-base">{finalTotal} lei</span></div>
            </div>

            {currentUser?.role === "client" ? (
              <button onClick={handleBuyTickets} disabled={selectedSoldOut} className="btn-primary mt-6 w-full py-3">
                {selectedSoldOut ? "SOLD OUT" : "Cumpara bilete"}
              </button>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Pentru a cumpara bilete, autentifica-te ca utilizator de tip client.</div>
            )}
            {allSoldOut ? <p className="mt-4 text-sm font-medium text-rose-300">Toate tipurile de bilete sunt SOLD OUT.</p> : null}
            {successMessage ? <p className="mt-4 text-sm font-medium text-emerald-300">{successMessage}</p> : null}
            {errorMessage ? <p className="mt-4 text-sm font-medium text-rose-400">{errorMessage}</p> : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
