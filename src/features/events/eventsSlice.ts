import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { mockEvents } from "./mockEvents";
import type { EventItem, EventStatus } from "./eventTypes";

interface EventsState {
  items: EventItem[];
}

const initialState: EventsState = {
  items: mockEvents,
};

interface CreateEventPayload {
  title: string;
  category: string;
  city: string;
  venueName: string;
  venueAddress: string;
  date: string;
  description: string;
  organizerId?: string;
}

interface UpdateEventPayload {
  id: string;
  data: Partial<Omit<EventItem, "id" | "createdAt">>;
}

interface SetEventStatusPayload {
  id: string;
  status: EventStatus;
}

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<CreateEventPayload>) => {
      const newEvent: EventItem = {
        id: crypto.randomUUID(),
        status: "draft",
        createdAt: new Date().toISOString(),
        ...action.payload,
      };

      state.items.unshift(newEvent);
    },

    updateEvent: (state, action: PayloadAction<UpdateEventPayload>) => {
      const event = state.items.find((item) => item.id === action.payload.id);
      if (event) {
        Object.assign(event, action.payload.data);
      }
    },

    setEventStatus: (state, action: PayloadAction<SetEventStatusPayload>) => {
      const event = state.items.find((item) => item.id === action.payload.id);
      if (event) {
        event.status = action.payload.status;
      }
    },
  },
});

export const { addEvent, updateEvent, setEventStatus } = eventsSlice.actions;
export default eventsSlice.reducer;