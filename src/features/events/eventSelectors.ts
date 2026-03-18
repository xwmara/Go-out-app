import type { RootState } from "../../app/store/store";

export const selectAllEvents = (state: RootState) => state.events.items;

export const selectOrganizerEvents = (state: RootState) => {
  const currentUserId = state.auth.user?.id;

  if (!currentUserId) {
    return [];
  }

  return state.events.items.filter(
    (event) => event.organizerId === currentUserId,
  );
};

export const selectPublishedEvents = (state: RootState) =>
  state.events.items.filter((event) => event.status === "published");
