import { api } from "../../services/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  UserRole,
} from "./authTypes";

interface BackendAuthUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

interface BackendLoginResponse {
  message: string;
  token: string;
  user: BackendAuthUser;
}

interface BackendRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

interface BackendLoginRequest {
  email: string;
  password: string;
}

interface BackendProfileRequest {
  fullName: string;
  email: string;
}

const normalizeRole = (role: string): UserRole => {
  switch (role.toLowerCase()) {
    case "admin":
      return "admin";
    case "organizer":
      return "organizer";
    case "client":
    case "user":
    default:
      return "client";
  }
};

const mapBackendUser = (user: BackendAuthUser): AuthUser => ({
  id: String(user.id),
  name: user.fullName,
  email: user.email,
  role: normalizeRole(user.role),
});

const buildRegisterRequest = (payload: RegisterPayload): BackendRegisterRequest => ({
  fullName: payload.name,
  email: payload.email,
  password: payload.password,
  role: payload.role,
});

export const authService = {
  async register(payload: RegisterPayload): Promise<void> {
    await api.post("/Auth/register", buildRegisterRequest(payload));
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const request: BackendLoginRequest = {
      email: payload.email,
      password: payload.password,
    };

    const { data } = await api.post<BackendLoginResponse>("/Auth/login", request);

    return {
      message: data.message,
      token: data.token,
      user: mapBackendUser(data.user),
    };
  },

  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await api.get<BackendAuthUser>("/Auth/me");
    return mapBackendUser(data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const request: BackendProfileRequest = {
      fullName: payload.name,
      email: payload.email,
    };

    const { data } = await api.put<BackendAuthUser>("/Auth/me", request);
    return mapBackendUser(data);
  },
};
