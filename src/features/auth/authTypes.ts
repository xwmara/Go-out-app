export type UserRole = 'client' | 'organizer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
}
