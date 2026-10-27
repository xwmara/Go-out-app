import type { UserRole } from './authTypes';

export const getRedirectPathByRole = (role?: UserRole | null) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'organizer':
      return '/organizer/dashboard';
    case 'client':
    default:
      return '/';
  }
};