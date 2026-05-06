import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectAllEvents } from "../features/events/eventSelectors";
import { fetchEventById } from "../features/events/eventsSlice";

type PromotionTab = "invitations" | "notifications";
type InvitationType = "nominal" | "open" | "guestlist";

function PurpleShape({ className }: { className: string }) {
  return <div className={`pointer-events-none absolute rounded-[45%] bg-[#6724e8] opacity-95 ${className}`} />;
}

export default function OrganizerEventPromotion() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const event = useAppSelector((state) => selectAllEvents(state).find((item) => item.id === id));
  const [activeTab, setActiveTab] = useState<PromotionTab>("invitations");
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [invitationType, setInvitationType] = useState<InvitationType>("nominal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      void dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  const ticketTypes = useMemo(() => {
    if (event?.ticketTypes?.length) return event.ticketTypes;
    if (event?.ticketPrice) return [{ id: "general", name: "General Access", price: event.ticketPrice }];
    return [];
  }, [event]);

  useEffect(() => {
    if (!ticketTypeId && ticketTypes[0]) {
      setTicketTypeId(ticketTypes[0].id);
    }
  }, [ticketTypeId, ticketTypes]);

  const eventTitle = event?.title ?? "Eveniment";
  const selectedTicket = ticketTypes.find((ticket) => ticket.id === ticketTypeId) ?? ticketTypes[0];

  const sendInvitations = () => {
    if (!selectedTicket) {
      setMessage("Nu exista tipuri de bilete pentru invitatii.");
      return;
    }

    if (invitationType === "nominal" && (!firstName.trim() || !lastName.trim() || !email.trim())) {
      setMessage("Completeaza nume, prenume si email pentru invitatia nominala.");
      return;
    }

    setMessage("Invitatiile au fost pregatite pentru trimitere. Legam trimiterea reala cand avem endpointul de email.");
  };

  const sendNotification = () => {
    if (!subject.trim() || !description.trim()) {
      setMessage("Completeaza subiectul si descrierea notificarii.");
      return;
    }

    setMessage("Notificarea a fost pregatita. Trimiterea reala se va lega cand avem endpointul de push notifications.");
  };

  return (
    <div className="relative min-h-[calc(100vh-180px)] overflow-hidden pb-12">
      <PurpleShape className="left-[-190px] bottom-[-230px] h-[360px] w-[360px]" />
      <PurpleShape className="right-[-135px] bottom-[-185px] h-[330px] w-[260px]" />
      <PurpleShape className="left-[40%] top-[80px] h-[230px] w-[250px]" />

      <section className="relative z-10 max-w-[1420px] space-y-8">
        <div>
          <h2 className="text-5xl font-black tracking-tight text-white">Promovare</h2>
          <p className="mt-2 text-2xl font-black text-white/90">{eventTitle}</p>
        </div>

        <div className="flex flex-wrap gap-8 text-2xl font-black text-white">
          <button
            type="button"
            onClick={() => setActiveTab("invitations")}
            className={`pb-1 transition ${activeTab === "invitations" ? "border-b-2 border-[#6724e8] text-white" : "text-white/75 hover:text-white"}`}
          >
            Trimite invitatii
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`pb-1 transition ${activeTab === "notifications" ? "border-b-2 border-[#6724e8] text-white" : "text-white/75 hover:text-white"}`}
          >
            Notificari clienti
          </button>
        </div>

        {message ? (
          <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-sm font-semibold text-white/80">
            {message}
          </div>
        ) : null}

        <div className="rounded-[0.6rem] border-2 border-white/90 bg-transparent p-6 lg:p-16">
          {activeTab === "invitations" ? (
            <div className="space-y-7">
              <h3 className="text-4xl font-black text-white">Trimite invitatii</h3>

              <label className="block space-y-3">
                <span className="text-2xl font-black text-white">Selecteaza tipul biletului</span>
                <select
                  value={ticketTypeId}
                  onChange={(event) => setTicketTypeId(event.target.value)}
                  className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-xl font-black text-white outline-none focus:border-[#6724e8]"
                >
                  {ticketTypes.map((ticket) => (
                    <option key={ticket.id} value={ticket.id} className="bg-[#111] text-white">
                      {ticket.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 lg:grid-cols-3">
                {[
                  { key: "nominal", label: "Invitatie nominala" },
                  { key: "open", label: "Invitatie nenominala" },
                  { key: "guestlist", label: "Guestlist" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setInvitationType(option.key as InvitationType)}
                    className={`rounded-full border-2 px-5 py-3 text-xl font-black transition ${
                      invitationType === option.key
                        ? "border-white bg-[#6724e8] text-white"
                        : "border-white/90 bg-transparent text-white hover:bg-white/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {invitationType === "nominal" ? (
                  <>
                    <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Nume" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-white/45 focus:border-[#6724e8]" />
                    <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Prenume" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-white/45 focus:border-[#6724e8]" />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-white/45 focus:border-[#6724e8]" />
                  </>
                ) : (
                  <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email destinatar" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-white/45 focus:border-[#6724e8]" />
                )}
                <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} placeholder="Cantitate" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-white/45 focus:border-[#6724e8]" />
              </div>

              <div className="flex justify-end pt-3">
                <button type="button" onClick={sendInvitations} className="rounded-full bg-[#6724e8] px-7 py-3 text-xl font-black text-white shadow-[0_18px_42px_rgba(103,36,232,0.35)] transition hover:bg-[#7c3aed]">
                  Trimite invitatiile
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 xl:grid-cols-[0.9fr_1fr] xl:items-start">
              <div>
                <h3 className="text-4xl font-black text-white">Notificari clienti</h3>
                <p className="mt-2 max-w-3xl text-xl font-semibold leading-snug text-white/58">
                  Poti trimite maxim o notificare per eveniment pentru clientii tai. Acestia o vor primi pe telefonul lor precum in imaginea prezentata.
                </p>

                <div className="mt-6 space-y-5">
                  <label className="block space-y-2">
                    <span className="text-2xl font-black text-white">Subiect:</span>
                    <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subiect" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-white/45 focus:border-[#6724e8]" />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-2xl font-black text-white">Descriere:</span>
                    <textarea value={description} maxLength={78} onChange={(event) => setDescription(event.target.value)} placeholder="Scrie aici... ( maxim 78 caractere )" rows={5} className="w-full resize-none rounded-2xl border-2 border-white/85 bg-transparent px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-white/45 focus:border-[#6724e8]" />
                    <span className="text-sm font-semibold text-white/45">{description.length}/78 caractere</span>
                  </label>
                </div>
              </div>

              <div className="pt-10 xl:pt-28">
                <div className="mx-auto max-w-[660px] rounded-xl bg-[#a7a7a7] px-5 py-5 text-[#121212] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[10px] font-black text-white">2nite</div>
                      <div>
                        <p className="text-xl font-black">2nite - City Engager</p>
                        <p className="mt-2 max-w-md text-sm font-semibold text-black/65">{subject || "Subiectul notificarii"}</p>
                        <p className="mt-1 max-w-md text-sm font-semibold text-black/65">{description || "Textul notificarii va aparea aici."}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-lg font-semibold text-slate-600">1s ago</span>
                      {event?.imageUrl ? <img src={event.imageUrl} alt="Event poster" className="h-16 w-16 rounded-xl object-cover" /> : null}
                    </div>
                  </div>
                </div>

                <div className="mt-36 flex justify-end">
                  <button type="button" onClick={sendNotification} className="rounded-full bg-[#6724e8] px-7 py-3 text-xl font-black text-white shadow-[0_18px_42px_rgba(103,36,232,0.35)] transition hover:bg-[#7c3aed]">
                    Trimite notificare
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
