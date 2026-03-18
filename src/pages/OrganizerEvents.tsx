import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/hook";
import { selectOrganizerEvents } from "../features/events/eventSelectors";
import { setEventStatus } from "../features/events/eventsSlice";

export default function OrganizerEvents() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectOrganizerEvents);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Events</h1>
          <p className="mt-2 text-slate-600">
            Vezi și administrează evenimentele create.
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="rounded-xl bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-medium text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
        >
          Create Event
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-slate-500">Nu ai încă evenimente create.</p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{event.title}</h3>
                  <p className="text-sm text-slate-500">
                    {event.date} • {event.city} • {event.venueName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      event.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {event.status}
                  </span>

                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    Edit
                  </Link>

                  {event.status === "draft" ? (
                    <button
                      onClick={() =>
                        dispatch(setEventStatus({ id: event.id, status: "published" }))
                      }
                      className="rounded-lg bg-[linear-gradient(135deg,#7c3aed,#111827)] px-4 py-2 text-sm text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        dispatch(setEventStatus({ id: event.id, status: "draft" }))
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      Move to Draft
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
