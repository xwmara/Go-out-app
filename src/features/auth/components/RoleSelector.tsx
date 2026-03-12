export type AuthRole = "client" | "organizer";

interface RoleSelectorProps {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
}

export default function RoleSelector({
  value,
  onChange,
}: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onChange("client")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          value === "client"
            ? "bg-slate-900 text-white shadow"
            : "bg-transparent text-slate-600 hover:bg-slate-200"
        }`}
      >
        Client
      </button>

      <button
        type="button"
        onClick={() => onChange("organizer")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          value === "organizer"
            ? "bg-slate-900 text-white shadow"
            : "bg-transparent text-slate-600 hover:bg-slate-200"
        }`}
      >
        Organizer
      </button>
    </div>
  );
}