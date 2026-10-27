import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectAllEvents } from "../features/events/eventSelectors";
import { eventsService } from "../features/events/eventsService";
import { fetchEventById } from "../features/events/eventsSlice";

type PromotionTab = "invitations" | "notifications";
type InvitationType = "nominal" | "open" | "guestlist";

function PurpleShape({ className }: { className: string }) {
  return <div className={`pointer-events-none absolute rounded-[45%] bg-wine-600 opacity-95 ${className}`} />;
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
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

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

  const sendInvitations = async () => {
    if (!id) {
      setMessage("Evenimentul nu a fost gasit.");
      return;
    }

    if (!selectedTicket) {
      setMessage("Nu exista tipuri de bilete pentru invitatii.");
      return;
    }

    if (invitationType === "nominal" && (!firstName.trim() || !lastName.trim() || !email.trim())) {
      setMessage("Completeaza nume, prenume si email pentru invitatia nominala.");
      return;
    }

    if (!email.trim()) {
      setMessage("Completeaza email-ul destinatarului.");
      return;
    }

    setIsSendingInvitation(true);
    setMessage("");

    try {
      const responseMessage = await eventsService.sendInvitation(id, {
        ticketTypeId,
        ticketTypeName: selectedTicket.name,
        invitationType,
        firstName,
        lastName,
        email,
        quantity,
      });
      setMessage(responseMessage);
    } catch (error) {
      const fallbackMessage = "Nu am putut trimite invitatia. Verifica configuratia SMTP si incearca din nou.";
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        setMessage(response?.data?.message ?? fallbackMessage);
      } else {
        setMessage(fallbackMessage);
      }
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const sendNotification = async () => {
    if (!id) {
      setMessage("Evenimentul nu a fost gasit.");
      return;
    }

    if (!subject.trim() || !description.trim()) {
      setMessage("Completeaza subiectul si descrierea notificarii.");
      return;
    }

    setIsSendingNotification(true);
    setMessage("");

    try {
      const responseMessage = await eventsService.sendNotification(id, {
        subject,
        description,
      });
      setMessage(responseMessage);
    } catch (error) {
      const fallbackMessage = "Nu am putut trimite notificarea. Verifica daca exista clienti cu bilete si configuratia SMTP.";
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        setMessage(response?.data?.message ?? fallbackMessage);
      } else {
        setMessage(fallbackMessage);
      }
    } finally {
      setIsSendingNotification(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-180px)] overflow-hidden pb-8 sm:pb-12">
      <PurpleShape className="left-[-220px] bottom-[-250px] h-[320px] w-[320px] sm:left-[-190px] sm:bottom-[-230px] sm:h-[360px] sm:w-[360px]" />
      <PurpleShape className="right-[-180px] bottom-[-210px] h-[300px] w-[240px] sm:right-[-135px] sm:bottom-[-185px] sm:h-[330px] sm:w-[260px]" />
      <PurpleShape className="left-[50%] top-[110px] h-[180px] w-[190px] sm:left-[40%] sm:top-[80px] sm:h-[230px] sm:w-[250px]" />

      <section className="relative z-10 w-full max-w-[1420px] space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">Promovare</h2>
          <p className="mt-2 text-xl font-black text-white/90 sm:text-2xl">{eventTitle}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-xl font-black text-white sm:gap-8 sm:text-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("invitations")}
            className={`pb-1 transition ${activeTab === "invitations" ? "border-b-2 border-wine-500 text-white" : "text-white/75 hover:text-white"}`}
          >
            Trimite invitatii
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`pb-1 transition ${activeTab === "notifications" ? "border-b-2 border-wine-500 text-white" : "text-white/75 hover:text-white"}`}
          >
            Notificari clienti
          </button>
        </div>

        {message ? (
          <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-sm font-semibold text-white/80">
            {message}
          </div>
        ) : null}

        <div className="rounded-[0.6rem] border-2 border-white/90 bg-transparent p-4 sm:p-6 lg:p-16">
          {activeTab === "invitations" ? (
            <div className="space-y-7">
              <h3 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">Trimite invitatii</h3>

              <label className="block space-y-3">
                <span className="text-xl font-black text-white sm:text-2xl">Selecteaza tipul biletului</span>
                <select
                  value={ticketTypeId}
                  onChange={(event) => setTicketTypeId(event.target.value)}
                  className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-base font-black text-white outline-none focus:border-wine-500 sm:text-xl"
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
                    className={`rounded-full border-2 px-4 py-3 text-base font-black transition sm:px-5 sm:text-xl ${
                      invitationType === option.key
                        ? "border-white bg-wine-600 text-white"
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
                    <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Nume" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/45 focus:border-wine-500 sm:text-xl" />
                    <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Prenume" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/45 focus:border-wine-500 sm:text-xl" />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/45 focus:border-wine-500 sm:text-xl" />
                  </>
                ) : (
                  <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email destinatar" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/45 focus:border-wine-500 sm:text-xl" />
                )}
                <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} placeholder="Cantitate" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/45 focus:border-wine-500 sm:text-xl" />
              </div>

              <div className="flex justify-end pt-3">
                <button type="button" onClick={() => void sendInvitations()} disabled={isSendingInvitation} className="w-full rounded-full bg-wine-600 px-6 py-3 text-base font-black text-white shadow-glow transition hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7 sm:text-xl">
                  {isSendingInvitation ? "Se trimite..." : "Trimite invitatiile"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 xl:grid-cols-[0.9fr_1fr] xl:items-start">
              <div>
                <h3 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">Notificari clienti</h3>
                <p className="mt-2 max-w-3xl text-base font-semibold leading-snug text-white/58 sm:text-xl">
                  Poti trimite maxim o notificare per eveniment pentru clientii tai. Acestia o vor primi pe telefonul lor precum in imaginea prezentata.
                </p>

                <div className="mt-6 space-y-5">
                  <label className="block space-y-2">
                    <span className="text-xl font-black text-white sm:text-2xl">Subiect:</span>
                    <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subiect" className="w-full rounded-full border-2 border-white/85 bg-transparent px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/45 focus:border-wine-500 sm:text-xl" />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xl font-black text-white sm:text-2xl">Descriere:</span>
                    <textarea value={description} maxLength={78} onChange={(event) => setDescription(event.target.value)} placeholder="Scrie aici... ( maxim 78 caractere )" rows={5} className="w-full resize-none rounded-2xl border-2 border-white/85 bg-transparent px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/45 focus:border-wine-500 sm:text-xl" />
                    <span className="text-sm font-semibold text-white/45">{description.length}/78 caractere</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 sm:pt-8 xl:pt-28">
                <div className="mx-auto max-w-[660px] rounded-xl bg-[#a7a7a7] px-4 py-4 text-[#121212] shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:px-5 sm:py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[10px] font-black text-white">2nite</div>
                      <div>
                        <p className="text-base font-black sm:text-xl">2nite - City Engager</p>
                        <p className="mt-2 max-w-md text-sm font-semibold text-black/65">{subject || "Subiectul notificarii"}</p>
                        <p className="mt-1 max-w-md text-sm font-semibold text-black/65">{description || "Textul notificarii va aparea aici."}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-sm font-semibold text-slate-600 sm:text-lg">1s ago</span>
                      {event?.imageUrl ? <img src={event.imageUrl} alt="Event poster" className="h-16 w-16 rounded-xl object-cover" /> : null}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end sm:mt-16 xl:mt-36">
                  <button type="button" onClick={() => void sendNotification()} disabled={isSendingNotification} className="w-full rounded-full bg-wine-600 px-6 py-3 text-base font-black text-white shadow-glow transition hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7 sm:text-xl">
                    {isSendingNotification ? "Se trimite..." : "Trimite notificare"}
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
