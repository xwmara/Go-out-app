import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store/store";

export const selectAllEvents = (state: RootState) => state.events.items;

const selectEventsItems = (state: RootState) => state.events.items;
const selectAuthUserId = (state: RootState) => state.auth.user?.id;

export const selectOrganizerEvents = createSelector(
  [selectEventsItems, selectAuthUserId],
  (items, currentUserId) =>
    currentUserId ? items.filter((event) => event.organizerId === currentUserId) : [],
);

export const selectPublishedEvents = createSelector(
  [selectEventsItems],
  (items) => items.filter((event) => event.status === "published"),
);
