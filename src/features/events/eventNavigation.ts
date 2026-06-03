import type { AuthUser } from "../auth/authTypes";
import type { EventItem } from "./eventTypes";

/**
 * Decides where a click on an event should navigate, based on ownership/role:
 * - organizer opening their OWN event  -> edit page in the organizer workspace
 * - everyone else (clients, other organizers, guests) -> public event details
 *
 * Pure routing helper — does not touch backend calls or auth logic.
 */
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
