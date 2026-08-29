import { pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { mealTypeEnum, attendanceStatusEnum, attendanceMethodEnum } from "./enums";
import { users } from "./users";
import { messes } from "./messes";

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messId: text("mess_id")
    .notNull()
    .references(() => messes.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(), // ISO YYYY-MM-DD format
  mealType: mealTypeEnum("meal_type").notNull(),
  status: attendanceStatusEnum("status").default("PRESENT").notNull(),
  method: attendanceMethodEnum("method").default("QR").notNull(),
  markedBy: text("marked_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex("attendance_user_mess_date_meal_idx").on(table.userId, table.messId, table.date, table.mealType)
]);

export type AttendanceRecord = typeof attendance.$inferSelect;
export type NewAttendanceRecord = typeof attendance.$inferInsert;
