import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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
}

const loadInitialTickets = (): TicketItem[] => {
  const raw = localStorage.getItem("goout_tickets");

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as TicketItem[];
  } catch {
    return [];
  }
};

const initialState: TicketsState = {
  items: loadInitialTickets(),
};

const persistTickets = (items: TicketItem[]) => {
  localStorage.setItem("goout_tickets", JSON.stringify(items));
};

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    purchaseTicket: (state, action: PayloadAction<PurchaseTicketPayload>) => {
      const ticket: TicketItem = {
        id: crypto.randomUUID(),
        totalPrice: action.payload.unitPrice * action.payload.quantity,
        purchasedAt: new Date().toISOString(),
        ...action.payload,
      };

      state.items.unshift(ticket);
      persistTickets(state.items);
    },
  },
});

export const { purchaseTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer;
