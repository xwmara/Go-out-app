import { Link } from "react-router-dom";
import { useAppSelector } from "../app/store/hook";
import { selectOrganizerEvents } from "../features/events/eventSelectors";

export default function OrganizerDashboard() {
  const events = useAppSelector(selectOrganizerEvents);

  const publishedCount = events.filter((event) => event.status === "published").length;
  const draftCount = events.filter((event) => event.status === "draft").length;
  const recentEvents = [...events].slice(0, 3);

  const stats = [
    { label: "Evenimente create", value: events.length },
    { label: "Publicate", value: publishedCount },
    { label: "Draft", value: draftCount },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Organizer Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Administrează evenimentele și urmărește performanța lor.
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="rounded-xl bg-[linear-gradient(135deg,#7c3aed,#111827)] px-5 py-3 font-medium text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
        >
          Create Event
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Evenimente recente
          </h2>

          <Link
            to="/organizer/events"
            className="text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            Vezi toate
          </Link>
        </div>

        <div className="space-y-4">
          {recentEvents.length === 0 ? (
            <p className="text-slate-500">Nu ai încă evenimente.</p>
          ) : (
            recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{event.title}</h3>
                  <p className="text-sm text-slate-500">
                    {event.date} • {event.city} • {event.venueName}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    event.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
