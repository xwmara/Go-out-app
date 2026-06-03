import type { UserRole } from '../authTypes';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSelector({
  selectedRole,
  onChange,
}: RoleSelectorProps) {
  const baseClass =
    'rounded-xl border px-4 py-3 text-sm font-semibold transition duration-200';
  const activeClass = 'border-wine-500 bg-wine-600/20 text-white shadow-glow-sm';
  const idleClass =
    'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white';

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-300">Alege rolul</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('client')}
          className={`${baseClass} ${selectedRole === 'client' ? activeClass : idleClass}`}
        >
          Client
        </button>

        <button
          type="button"
          onClick={() => onChange('organizer')}
          className={`${baseClass} ${selectedRole === 'organizer' ? activeClass : idleClass}`}
        >
          Organizer
        </button>
      </div>
    </div>
  );
}
