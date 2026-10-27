import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectCurrentUser } from "../features/auth/authSelectors";
import { romanianCities } from "../features/events/cities";
import { addEvent } from "../features/events/eventsSlice";
import type { EventTicketType } from "../features/events/eventTypes";

const createTicketType = (): EventTicketType => ({
  id: crypto.randomUUID(),
  name: "",
  price: 0,
  availableQuantity: 100,
  description: "",
  soldOut: false,
});

const buttonClass = "btn-primary px-6 py-3";

export default function CreateEvent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [performersInput, setPerformersInput] = useState("");
  const [ticketTypes, setTicketTypes] = useState<EventTicketType[]>([createTicketType()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setPosterFile = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePosterChange = (e: ChangeEvent<HTMLInputElement>) => setPosterFile(e.target.files?.[0]);

  const handlePosterDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setPosterFile(e.dataTransfer.files?.[0]);
  };

  const updateTicketType = (
    ticketTypeId: string,
    field: "name" | "price" | "availableQuantity" | "description",
    value: string,
  ) => {
    setTicketTypes((current) =>
      current.map((ticketType) =>
        ticketType.id === ticketTypeId
          ? {
              ...ticketType,
              [field]:
                field === "price" || field === "availableQuantity" ? Number(value) : value,
            }
          : ticketType,
      ),
    );
  };

  const addTicketTypeField = () => setTicketTypes((current) => [...current, createTicketType()]);

  const removeTicketTypeField = (ticketTypeId: string) => {
    setTicketTypes((current) =>
      current.length === 1 ? current : current.filter((ticketType) => ticketType.id !== ticketTypeId),
    );
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) nextErrors.title = "Titlul este obligatoriu.";
    if (!category.trim()) nextErrors.category = "Categoria este obligatorie.";
    if (!city.trim()) nextErrors.city = "Orasul este obligatoriu.";
    if (!venueName.trim()) nextErrors.venueName = "Venue-ul este obligatoriu.";
    if (!venueAddress.trim()) nextErrors.venueAddress = "Adresa venue-ului este obligatorie.";
    if (!date.trim()) nextErrors.date = "Data este obligatorie.";
    if (!description.trim()) nextErrors.description = "Descrierea este obligatorie.";
    if (!imageUrl) nextErrors.imageUrl = "Afisul evenimentului este obligatoriu.";

    const hasValidTicketTypes = ticketTypes.every(
      (ticketType) => ticketType.name.trim() && ticketType.price > 0,
    );

    if (!hasValidTicketTypes) {
      nextErrors.ticketTypes = "Completeaza toate tipurile de bilete cu nume si pret.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    if (!currentUser) {
      setSubmitError("Trebuie sa fii autentificat ca organizator ca sa creezi un eveniment.");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        addEvent({
          title: title.trim(),
          category: category.trim(),
          city,
          venueName: venueName.trim(),
          venueAddress: venueAddress.trim(),
          date,
          description: description.trim(),
          imageUrl,
          performers: performersInput
            .split(",")
            .map((performer) => performer.trim())
            .filter(Boolean),
          ticketTypes: ticketTypes.map((ticketType) => ({
            ...ticketType,
            name: ticketType.name.trim(),
          })),
          organizerId: currentUser.id,
        }),
      ).unwrap();

      navigate("/organizer/dashboard");
    } catch (error) {
      const message = typeof error === "string" ? error : "Nu am putut crea evenimentul.";
      setSubmitError(message);

      if (message.includes("Sesiunea a expirat")) {
        setTimeout(() => navigate("/login"), 1200);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="animate-fade-up">
        <p className="eyebrow">Eveniment nou</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-white">Create Event</h1>
        <p className="mt-2 text-slate-400">Creeaza un eveniment nou cu afis si tipuri de bilete configurabile.</p>
      </div>

      <form onSubmit={handleSubmit} className="card animate-fade-up space-y-5 p-6 sm:p-8" style={{ animationDelay: "0.06s" }}>
        {submitError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
            {submitError}
          </div>
        ) : null}

        <div
          onDrop={handlePosterDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-wine-500/30 bg-wine-600/[0.06] p-6 transition hover:border-wine-500/60 hover:bg-wine-600/10"
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePosterChange} className="hidden" />
          <p className="eyebrow">Event poster</p>
          <p className="mt-2 text-slate-400">Drag and drop pentru afis sau apasa ca sa incarci o imagine.</p>
          {imageUrl ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
              <img src={imageUrl} alt="Poster preview" className="h-72 w-full object-cover" />
            </div>
          ) : null}
          {errors.imageUrl ? <p className="mt-3 text-sm text-red-500">{errors.imageUrl}</p> : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="field-label">Titlu eveniment</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title}</p>}
          </div>
          <div>
            <label className="field-label">Categorie</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input" />
            {errors.category && <p className="mt-1 text-sm text-rose-400">{errors.category}</p>}
          </div>
          <div>
            <label className="field-label">Oras</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
              <option value="" className="bg-ink-800">Selecteaza un oras</option>
              {romanianCities.map((cityOption) => (
                <option key={cityOption} value={cityOption} className="bg-ink-800">{cityOption}</option>
              ))}
            </select>
            {errors.city && <p className="mt-1 text-sm text-rose-400">{errors.city}</p>}
          </div>
          <div>
            <label className="field-label">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            {errors.date && <p className="mt-1 text-sm text-rose-400">{errors.date}</p>}
          </div>
          <div>
            <label className="field-label">Venue</label>
            <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} className="input" />
            {errors.venueName && <p className="mt-1 text-sm text-rose-400">{errors.venueName}</p>}
          </div>
          <div>
            <label className="field-label">Adresa venue</label>
            <input type="text" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} className="input" />
            {errors.venueAddress && <p className="mt-1 text-sm text-rose-400">{errors.venueAddress}</p>}
          </div>
        </div>

        <div>
          <label className="field-label">Descriere</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="input" />
          {errors.description && <p className="mt-1 text-sm text-rose-400">{errors.description}</p>}
        </div>

        <div>
          <label className="field-label">Artisti / lineup</label>
          <input type="text" value={performersInput} onChange={(e) => setPerformersInput(e.target.value)} placeholder="Ex: Karla Noir, Nico V, Pulse District" className="input" />
          <p className="mt-2 text-sm text-slate-500">Optional. Separa artistii prin virgula.</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Ticket types</p>
              <p className="mt-1 text-sm text-slate-400">Adauga tipuri de bilete si pretul fiecaruia.</p>
            </div>
            <button type="button" onClick={addTicketTypeField} className="btn-outline">
              Add ticket type
            </button>
          </div>

          {ticketTypes.map((ticketType, index) => (
            <div key={ticketType.id} className="grid gap-3 rounded-2xl border border-white/10 bg-ink-900/40 p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_140px_140px_auto]">
                <input type="text" value={ticketType.name} onChange={(e) => updateTicketType(ticketType.id, "name", e.target.value)} placeholder={`Tip bilet ${index + 1} (ex: VIP)`} className="input" />
                <input type="number" min="1" value={ticketType.price || ""} onChange={(e) => updateTicketType(ticketType.id, "price", e.target.value)} placeholder="Pret" className="input" />
                <input type="number" min="0" value={ticketType.availableQuantity ?? ""} onChange={(e) => updateTicketType(ticketType.id, "availableQuantity", e.target.value)} placeholder="Cantitate" className="input" />
                <button type="button" onClick={() => removeTicketTypeField(ticketType.id)} className="btn-ghost border border-white/10">
                  Remove
                </button>
              </div>
              <input type="text" value={ticketType.description ?? ""} onChange={(e) => updateTicketType(ticketType.id, "description", e.target.value)} placeholder="Descriere (optional)" className="input" />
            </div>
          ))}
          {errors.ticketTypes ? <p className="text-sm text-rose-400">{errors.ticketTypes}</p> : null}
        </div>

        <button type="submit" disabled={isSubmitting} className={buttonClass}>
          {isSubmitting ? "Se creeaza..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}

