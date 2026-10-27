import type { RootState } from "../../app/store/store";

export const selectAllTickets = (state: RootState) => state.tickets.items;

export const selectCurrentUserTickets = (state: RootState) => {
  const currentUserId = state.auth.user?.id;

  if (!currentUserId) {
    return [];
  }

  return state.tickets.items.filter((ticket) => ticket.userId === currentUserId);
};
