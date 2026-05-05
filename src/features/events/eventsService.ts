import { api } from "../../services/api";
import type { EventItem, EventStatus } from "./eventTypes";

interface EventStatusPayload {
  id: string;
  status: EventStatus;
}

const normalizeEvent = (event: EventItem): EventItem => ({
  ...event,
  ticketTypes: event.ticketTypes ?? [],
  performers: event.performers ?? [],
});

export const eventsService = {
  async getPublished(): Promise<EventItem[]> {
    const { data } = await api.get<EventItem[]>("/Events/published");
    return data.map(normalizeEvent);
  },

  async getOrganizerEvents(): Promise<EventItem[]> {
    const { data } = await api.get<EventItem[]>("/Events/organizer/me");
    return data.map(normalizeEvent);
  },

  async getById(id: string): Promise<EventItem> {
    const { data } = await api.get<EventItem>(`/Events/${id}`);
    return normalizeEvent(data);
  },

  async create(payload: Omit<EventItem, "id" | "status" | "createdAt"> & { organizerId?: string }): Promise<EventItem> {
    const request = {
      title: payload.title,
      category: payload.category,
      city: payload.city,
      venueName: payload.venueName,
      venueAddress: payload.venueAddress,
      date: payload.date,
      description: payload.description,
      imageUrl: payload.imageUrl,
      performers: payload.performers ?? [],
      ticketTypes: payload.ticketTypes ?? [],
      availableTickets: payload.availableTickets,
    };

    const { data } = await api.post<EventItem>("/Events", request);
    return normalizeEvent(data);
  },

  async update(id: string, payload: Partial<Omit<EventItem, "id" | "createdAt">>): Promise<EventItem> {
    const request = {
      title: payload.title,
      category: payload.category,
      city: payload.city,
      venueName: payload.venueName,
      venueAddress: payload.venueAddress,
      date: payload.date,
      description: payload.description,
      imageUrl: payload.imageUrl,
      performers: payload.performers ?? [],
      ticketTypes: payload.ticketTypes ?? [],
      availableTickets: payload.availableTickets,
    };

    const { data } = await api.put<EventItem>(`/Events/${id}`, request);
    return normalizeEvent(data);
  },

  async updateStatus(payload: EventStatusPayload): Promise<EventItem> {
    const { data } = await api.patch<EventItem>(`/Events/${payload.id}/status`, {
      status: payload.status,
    });
    return normalizeEvent(data);
  },
};
