import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../../services/api";

export interface TicketItem {
  id: string;
  eventId: string;
  userId: string;
  eventTitle: string;
  eventDate: string;
  eventCity: string;
  venueName: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchasedAt: string;
  ticketCode: string;
  qrCodeValue: string;
  qrCodeUrl: string;
  invoiceNumber: string;
  invoiceUrl: string;
}

interface PurchaseTicketPayload {
  eventId: string;
  userId: string;
  eventTitle: string;
  eventDate: string;
  eventCity: string;
  venueName: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
}

interface TicketsState {
  items: TicketItem[];
  status: "idle" | "loading" | "succeeded" | "error";
  error: string | null;
}

const initialState: TicketsState = {
  items: [],
  status: "idle",
  error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

export const fetchMyTickets = createAsyncThunk<
  TicketItem[],
  void,
  { rejectValue: string }
>("tickets/fetchMyTickets", async (_, thunkApi) => {
  try {
    const { data } = await api.get<TicketItem[]>("/Tickets/me");
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut incarca biletele."));
  }
});

export const purchaseTicket = createAsyncThunk<
  TicketItem,
  PurchaseTicketPayload,
  { rejectValue: string }
>("tickets/purchase", async (payload, thunkApi) => {
  try {
    const { data } = await api.post<TicketItem>("/Tickets/purchase", {
      eventId: payload.eventId,
      ticketTypeName: payload.ticketTypeName,
      quantity: payload.quantity,
      unitPrice: payload.unitPrice,
    });
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut cumpara biletele."));
  }
});

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTickets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyTickets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Nu am putut incarca biletele.";
      })
      .addCase(purchaseTicket.pending, (state) => {
        state.error = null;
      })
      .addCase(purchaseTicket.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(purchaseTicket.rejected, (state, action) => {
        state.error = action.payload ?? "Nu am putut cumpara biletele.";
      });
  },
});

export default ticketsSlice.reducer;
