import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notificationAttempts = pgTable("notification_attempts", {
  id: text("id").primaryKey(),
  event: varchar("event", { length: 100 }).notNull(),
  channel: varchar("channel", { length: 30 }).notNull(),
  recipientUserId: text("recipient_user_id").references(() => users.id, { onDelete: "set null" }),
  recipient: varchar("recipient", { length: 255 }),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type NotificationAttempt = typeof notificationAttempts.$inferSelect;
export type NewNotificationAttempt = typeof notificationAttempts.$inferInsert;
