import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  AuthState,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from './authTypes';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

const getMockNameFromEmail = (email: string) => {
  const raw = email.split('@')[0];
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};


export const loginUser = createAsyncThunk<
  AuthUser,
  LoginPayload,
  { rejectValue: string }
>('auth/loginUser', async (payload, thunkApi) => {
 const { email, password, role } = payload;

  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!email || !password) {
    return thunkApi.rejectWithValue('Email și parola sunt obligatorii.');
  }

  if (password.length < 6) {
    return thunkApi.rejectWithValue('Parola trebuie să aibă minim 6 caractere.');
  }

  const mockUser: AuthUser = {
    id: crypto.randomUUID(),
    name: getMockNameFromEmail(email),
    email,role
    ,
  };

  localStorage.setItem('goout_user', JSON.stringify(mockUser));

  return mockUser;
});

export const registerUser = createAsyncThunk<
  AuthUser,
  RegisterPayload,
  { rejectValue: string }
>('auth/registerUser', async (payload, thunkApi) => {
  const { name, email, password, role } = payload;

  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!name || !email || !password || !role) {
    return thunkApi.rejectWithValue('Toate câmpurile sunt obligatorii.');
  }

  if (password.length < 6) {
    return thunkApi.rejectWithValue('Parola trebuie să aibă minim 6 caractere.');
  }

  const mockUser: AuthUser = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
  };

  localStorage.setItem('goout_user', JSON.stringify(mockUser));

  return mockUser;
});

const savedUser = localStorage.getItem('goout_user');

const preloadedUser: AuthUser | null = savedUser ? JSON.parse(savedUser) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    user: preloadedUser,
    isAuthenticated: !!preloadedUser,
    status: preloadedUser ? 'authenticated' : 'idle',
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('goout_user');
    },
    clearAuthError: (state) => {
      state.error = null;
      if (state.status === 'error') {
        state.status = 'idle';
      }
    },
    setMockUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = 'authenticated';
      state.error = null;
      localStorage.setItem('goout_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || 'Login eșuat.';
      })

      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || 'Înregistrare eșuată.';
      });
  },
});

export const { logout, clearAuthError, setMockUser } = authSlice.actions;
export default authSlice.reducer;