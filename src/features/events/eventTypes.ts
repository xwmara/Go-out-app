export type EventStatus = "draft" | "published";

export interface EventTicketType {
  id: string;
  name: string;
  price: number;
  availableQuantity?: number | null;
  description?: string | null;
  soldOut?: boolean;
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
  wasPublished?: boolean;
  publishedAt?: string | null;
  organizerId?: string;
  createdAt: string;
  ticketPrice?: number;
  availableTickets?: number;
  imageUrl?: string;
  performers?: string[];
  ticketTypes?: EventTicketType[];
}

export const isTicketTypeSoldOut = (ticketType: EventTicketType): boolean =>
  Boolean(ticketType.soldOut) ||
  (ticketType.availableQuantity !== null &&
    ticketType.availableQuantity !== undefined &&
    ticketType.availableQuantity <= 0);

export interface OrganizerEventSalesPoint {
  bucketStart: string;
  label: string;
  ticketsSold: number;
  revenue: number;
}

export interface OrganizerEventOrderItem {
  ticketId: string;
  customerName: string;
  customerEmail: string;
  ticketTypeName: string;
  quantity: number;
  totalPrice: number;
  purchasedAt: string;
}

export interface OrganizerEventOverview {
  event: EventItem;
  ticketsSold: number;
  revenue: number;
  ordersCount: number;
  availableTickets: number;
  salesTimeline: OrganizerEventSalesPoint[];
  recentOrders: OrganizerEventOrderItem[];
}
