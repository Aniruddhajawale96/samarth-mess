/** bookings.ts — maps to /bookings/* and /extra-meals routes */
import { api } from "./client";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";
export type BookingStatus = "BOOKED" | "SKIPPED" | "CANCELLED" | "EXTRA";

export interface MealBookingRecord {
  id: string;
  userId: string;
  messId: string;
  date: string;
  mealType: MealType;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingInput {
  messId: string;
  date: string;
  mealType: MealType;
  status: "BOOKED" | "SKIPPED";
}

export interface BookingsQuery {
  page?: number;
  limit?: number;
  date?: string;
}

/** POST /bookings — create or upsert a meal booking */
export function createBooking(input: BookingInput) {
  return api.post<{ booking: MealBookingRecord }>("/bookings", input);
}

/** PATCH /bookings/:bookingId */
export function updateBooking(bookingId: string, status: "BOOKED" | "SKIPPED" | "CANCELLED") {
  return api.patch<{ booking: MealBookingRecord }>(`/bookings/${bookingId}`, { status });
}

/** GET /bookings — paginated list of current user's bookings */
export function getBookings(query: BookingsQuery = {}) {
  return api.get<{ items: MealBookingRecord[]; page: number; limit: number }>("/bookings", {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    date: query.date,
  });
}

/** POST /extra-meals — CONFIRMED route */
export function bookExtraMeal(input: { messId: string; date: string; mealType: MealType }) {
  return api.post<{ booking: MealBookingRecord }>("/extra-meals", input);
}

/** GET /owner/extra-meals — CONFIRMED route */
export function getOwnerExtraMeals() {
  return api.get<{
    items: Array<{
      booking: MealBookingRecord;
      user: { id: string; name: string; phone: string };
      mess: { id: string; name: string };
    }>;
  }>("/owner/extra-meals");
}
