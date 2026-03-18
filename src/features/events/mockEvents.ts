import type { EventItem } from "./eventTypes";

export const mockEvents: EventItem[] = [
  {
    id: "1",
    title: "Jazz Night Downtown",
    category: "Music",
    city: "București",
    venueName: "Control Club",
    venueAddress: "Str. Constantin Mille 4",
    date: "2026-04-18",
    description: "O seară de jazz live în centrul orașului.",
    status: "published",
    organizerId: "mock-organizer",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Contemporary Art Expo",
    category: "Art",
    city: "Cluj-Napoca",
    venueName: "Muzeul de Artă",
    venueAddress: "Piața Unirii 30",
    date: "2026-04-25",
    description: "Expoziție de artă contemporană.",
    status: "draft",
    organizerId: "mock-organizer",
    createdAt: new Date().toISOString(),
  },
];