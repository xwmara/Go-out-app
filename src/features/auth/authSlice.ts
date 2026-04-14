import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  AuthResponse,
  AuthState,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "./authTypes";
import { authService } from "./authService";

const STORAGE_USER_KEY = "goout_user";
const STORAGE_TOKEN_KEY = "token";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/loginUser", async (payload, thunkApi) => {
  try {
    const response = await authService.login(payload);

    if (response.user.role !== payload.role) {
      return thunkApi.rejectWithValue("Rolul selectat nu corespunde contului tau.");
    }

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(STORAGE_TOKEN_KEY, response.token);

    return response;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message ?? "Autentificarea a esuat."
      );
    }

    return thunkApi.rejectWithValue("Autentificarea a esuat.");
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/registerUser", async (payload, thunkApi) => {
  try {
    await authService.register(payload);

    const response = await authService.login({
      email: payload.email,
      password: payload.password,
      role: payload.role,
    });

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(STORAGE_TOKEN_KEY, response.token);

    return response;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message ?? "Inregistrarea a esuat."
      );
    }

    return thunkApi.rejectWithValue("Inregistrarea a esuat.");
  }
});

const savedUser = localStorage.getItem(STORAGE_USER_KEY);
const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);

const preloadedUser: AuthUser | null = savedUser ? JSON.parse(savedUser) : null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...initialState,
    token: savedToken,
    user: preloadedUser,
    isAuthenticated: !!preloadedUser && !!savedToken,
    status: preloadedUser && savedToken ? "authenticated" : "idle",
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    },
    clearAuthError: (state) => {
      state.error = null;
      if (state.status === "error") {
        state.status = "idle";
      }
    },
    setMockUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.token = null;
      state.isAuthenticated = true;
      state.status = "authenticated";
      state.error = null;
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload || "Login esuat.";
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload || "Inregistrare esuata.";
      });
  },
});

export const { logout, clearAuthError, setMockUser } = authSlice.actions;
export default authSlice.reducer;
