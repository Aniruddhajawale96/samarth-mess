import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { subscriptionStatusEnum } from "./enums";
import { users } from "./users";
import { messes } from "./messes";

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messId: text("mess_id")
    .notNull()
    .references(() => messes.id, { onDelete: "cascade" }),
  status: subscriptionStatusEnum("status").default("PENDING_PAYMENT").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  autoRenew: boolean("auto_renew").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
