export type EventStatus = "draft" | "published";

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
}