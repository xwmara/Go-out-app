import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { eventsService } from "./eventsService";
import type { EventItem, EventStatus, EventTicketType } from "./eventTypes";

interface EventsState {
  items: EventItem[];
  status: "idle" | "loading" | "succeeded" | "error";
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  status: "idle",
  error: null,
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
  imageUrl?: string;
  performers?: string[];
  ticketTypes: EventTicketType[];
  availableTickets?: number;
}

interface UpdateEventPayload {
  id: string;
  data: Partial<Omit<EventItem, "id" | "createdAt">>;
}

interface SetEventStatusPayload {
  id: string;
  status: EventStatus;
}

const mergeItems = (existing: EventItem[], incoming: EventItem[]) => {
  const map = new Map(existing.map((item) => [item.id, item]));

  incoming.forEach((item) => {
    map.set(item.id, item);
  });

  return [...map.values()].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

const upsertItem = (items: EventItem[], incoming: EventItem) => mergeItems(items, [incoming]);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401) {
      return "Sesiunea a expirat sau nu esti autentificat. Logheaza-te din nou ca organizator.";
    }

    if (error.response?.status === 403) {
      return "Contul curent nu are permisiuni de organizator pentru aceasta actiune.";
    }

    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

export const fetchPublishedEvents = createAsyncThunk<EventItem[], void, { rejectValue: string }>("events/fetchPublished", async (_, thunkApi) => {
  try {
    return await eventsService.getPublished();
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut incarca evenimentele."));
  }
});

export const fetchOrganizerEvents = createAsyncThunk<EventItem[], void, { rejectValue: string }>("events/fetchOrganizer", async (_, thunkApi) => {
  try {
    return await eventsService.getOrganizerEvents();
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut incarca evenimentele organizatorului."));
  }
});

export const fetchEventById = createAsyncThunk<EventItem, string, { rejectValue: string }>("events/fetchById", async (id, thunkApi) => {
  try {
    return await eventsService.getById(id);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut incarca evenimentul."));
  }
});

export const addEvent = createAsyncThunk<EventItem, CreateEventPayload, { rejectValue: string }>("events/create", async (payload, thunkApi) => {
  try {
    return await eventsService.create(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut crea evenimentul."));
  }
});

export const updateEvent = createAsyncThunk<EventItem, UpdateEventPayload, { rejectValue: string }>("events/update", async (payload, thunkApi) => {
  try {
    return await eventsService.update(payload.id, payload.data);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut actualiza evenimentul."));
  }
});

export const setEventStatus = createAsyncThunk<EventItem, SetEventStatusPayload, { rejectValue: string }>("events/setStatus", async (payload, thunkApi) => {
  try {
    return await eventsService.updateStatus(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut schimba statusul evenimentului."));
  }
});

export const deleteEvent = createAsyncThunk<string, string, { rejectValue: string }>("events/delete", async (id, thunkApi) => {
  try {
    await eventsService.remove(id);
    return id;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Nu am putut sterge evenimentul."));
  }
});

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishedEvents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPublishedEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = mergeItems(state.items, action.payload);
      })
      .addCase(fetchPublishedEvents.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Nu am putut incarca evenimentele.";
      })
      .addCase(fetchOrganizerEvents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = mergeItems(state.items, action.payload);
      })
      .addCase(fetchOrganizerEvents.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Nu am putut incarca evenimentele organizatorului.";
      })
      .addCase(fetchEventById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = upsertItem(state.items, action.payload);
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Nu am putut incarca evenimentul.";
      })
      .addCase(addEvent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = upsertItem(state.items, action.payload);
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Nu am putut crea evenimentul.";
      })
      .addCase(updateEvent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = upsertItem(state.items, action.payload);
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Nu am putut actualiza evenimentul.";
      })
      .addCase(setEventStatus.fulfilled, (state, action) => {
        state.items = upsertItem(state.items, action.payload);
      })
      .addCase(setEventStatus.rejected, (state, action) => {
        state.error = action.payload ?? "Nu am putut schimba statusul evenimentului.";
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error = action.payload ?? "Nu am putut sterge evenimentul.";
      });
  },
});

export default eventsSlice.reducer;

