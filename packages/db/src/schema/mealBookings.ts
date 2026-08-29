import { pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { mealTypeEnum, mealBookingStatusEnum } from "./enums";
import { users } from "./users";
import { messes } from "./messes";

export const mealBookings = pgTable(
  "meal_bookings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    messId: text("mess_id")
      .notNull()
      .references(() => messes.id, { onDelete: "cascade" }),
    date: varchar("date", { length: 10 }).notNull(), // ISO YYYY-MM-DD format
    mealType: mealTypeEnum("meal_type").notNull(),
    status: mealBookingStatusEnum("status").default("BOOKED").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("meal_bookings_user_date_meal_idx").on(
      table.userId,
      table.date,
      table.mealType
    )
  ]
);

export type MealBooking = typeof mealBookings.$inferSelect;
export type NewMealBooking = typeof mealBookings.$inferInsert;
