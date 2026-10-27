import type { AuthUser } from "../auth/authTypes";
import type { EventItem } from "./eventTypes";

export const resolveEventHref = (
  event: Pick<EventItem, "id" | "organizerId">,
  user: AuthUser | null | undefined,
): string => {
  const isOwnerOrganizer =
    user?.role === "organizer" &&
    Boolean(event.organizerId) &&
    String(event.organizerId) === String(user.id);

  return isOwnerOrganizer
    ? `/organizer/events/${event.id}/edit`
    : `/events/${event.id}`;
};
