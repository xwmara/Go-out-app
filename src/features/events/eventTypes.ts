export type EventStatus = "draft" | "published";

export interface EventTicketType {
  id: string;
  name: string;
  price: number;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  city: string;
  venueName: string;
  venueAddress: string;
  date: string;
  description: string;
  status: EventStatus;
  organizerId?: string;
  createdAt: string;
  ticketPrice?: number;
  availableTickets?: number;
  imageUrl?: string;
  performers?: string[];
  ticketTypes?: EventTicketType[];
}
