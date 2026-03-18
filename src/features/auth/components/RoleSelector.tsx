import type { UserRole } from '../authTypes';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSelector({
  selectedRole,
  onChange,
}: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Alege rolul</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('client')}
          className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
            selectedRole === 'client'
              ? 'border-black bg-black text-white'
              : 'border-gray-300 bg-white text-gray-700'
          }`}
        >
          Client
        </button>

        <button
          type="button"
          onClick={() => onChange('organizer')}
          className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
            selectedRole === 'organizer'
              ? 'border-black bg-black text-white'
              : 'border-gray-300 bg-white text-gray-700'
          }`}
        >
          Organizer
        </button>
      </div>
    </div>
  );
}