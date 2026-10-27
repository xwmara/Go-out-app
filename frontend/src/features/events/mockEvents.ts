import type { EventItem } from "./eventTypes";

export const mockEvents: EventItem[] = [
  {
    id: "1",
    title: "Jazz Night Downtown",
    category: "Music",
    city: "Bucuresti",
    venueName: "Control Club",
    venueAddress: "Str. Constantin Mille 4",
    date: "2026-04-18",
    description:
      "O seara de jazz live in centrul orasului, cu artisti locali, cocktail bar si o atmosfera eleganta.",
    status: "published",
    organizerId: "mock-organizer",
    createdAt: new Date().toISOString(),
    ticketPrice: 79,
    availableTickets: 120,
    performers: ["The Blue Notes", "Mara Ionescu Quartet", "Late Session Band"],
    ticketTypes: [
      { id: "general-1", name: "General Access", price: 79 },
      { id: "vip-1", name: "VIP Table", price: 149 },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    title: "Contemporary Art Expo",
    category: "Art",
    city: "Cluj-Napoca",
    venueName: "Muzeul de Arta",
    venueAddress: "Piata Unirii 30",
    date: "2026-04-25",
    description:
      "Expozitie de arta contemporana cu instalatii multimedia, performance si tururi ghidate.",
    status: "draft",
    organizerId: "mock-organizer",
    createdAt: new Date().toISOString(),
    ticketPrice: 45,
    availableTickets: 80,
    performers: ["Atelier 22", "Ana Morar", "Visual Lab Collective"],
    ticketTypes: [
      { id: "standard-2", name: "Standard", price: 45 },
      { id: "guided-2", name: "Guided Tour", price: 70 },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    title: "Rooftop Techno Session",
    category: "Nightlife",
    city: "Bucuresti",
    venueName: "Skyline Rooftop",
    venueAddress: "Calea Victoriei 105",
    date: "2026-05-02",
    description:
      "Un party de noapte cu DJ set-uri techno, cocktail bar si vedere panoramica asupra orasului.",
    status: "published",
    organizerId: "mock-organizer",
    createdAt: new Date().toISOString(),
    ticketPrice: 99,
    availableTickets: 150,
    performers: ["Karla Noir", "Nico V", "Pulse District"],
    ticketTypes: [
      { id: "entry-3", name: "Entry Pass", price: 99 },
      { id: "backstage-3", name: "Backstage Access", price: 189 },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    title: "Street Food Weekend",
    category: "Food",
    city: "Timisoara",
    venueName: "Parcul Central",
    venueAddress: "Bd. Vasile Parvan 5",
    date: "2026-05-10",
    description:
      "Festival urban cu food trucks, deserturi artizanale, muzica live si zone de relaxare pentru grupuri.",
    status: "published",
    organizerId: "mock-organizer",
    createdAt: new Date().toISOString(),
    ticketPrice: 35,
    availableTickets: 300,
    performers: ["Street Kitchen Crew", "The Local Groove", "Sunset Acoustic Set"],
    ticketTypes: [
      { id: "day-4", name: "Day Pass", price: 35 },
      { id: "weekend-4", name: "Weekend Pass", price: 59 },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
  },
];
