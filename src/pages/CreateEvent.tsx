import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { addEvent } from "../features/events/eventsSlice";
import { romanianCities } from "../features/events/cities";
import { selectCurrentUser } from "../features/auth/authSelectors";

export default function CreateEvent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) nextErrors.title = "Titlul este obligatoriu.";
    if (!category.trim()) nextErrors.category = "Categoria este obligatorie.";
    if (!city.trim()) nextErrors.city = "Orașul este obligatoriu.";
    if (!venueName.trim()) nextErrors.venueName = "Venue-ul este obligatoriu.";
    if (!venueAddress.trim()) {
      nextErrors.venueAddress = "Adresa venue-ului este obligatorie.";
    }
    if (!date.trim()) nextErrors.date = "Data este obligatorie.";
    if (!description.trim()) {
      nextErrors.description = "Descrierea este obligatorie.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;
    if (!currentUser) return;

    dispatch(
      addEvent({
        title,
        category,
        city,
        venueName,
        venueAddress,
        date,
        description,
        organizerId: currentUser.id,
      })
    );

    navigate("/organizer/events");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Event</h1>
        <p className="mt-2 text-slate-600">
          Creează un eveniment nou în platformă.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Titlu eveniment
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Categorie
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Oraș
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          >
            <option value="">Selectează un oraș</option>
            {romanianCities.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Venue
          </label>
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Ex: Control Club"
          />
          {errors.venueName && (
            <p className="mt-1 text-sm text-red-500">{errors.venueName}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Adresă venue
          </label>
          <input
            type="text"
            value={venueAddress}
            onChange={(e) => setVenueAddress(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Ex: Str. Constantin Mille 4"
          />
          {errors.venueAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.venueAddress}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Dată
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Descriere
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}