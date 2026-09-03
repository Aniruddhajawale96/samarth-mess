import { pgTable, text, timestamp, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { paymentProviderEnum, paymentStatusEnum } from "./enums";
import { users } from "./users";
import { messes } from "./messes";
import { subscriptions } from "./subscriptions";

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messId: text("mess_id")
    .notNull()
    .references(() => messes.id, { onDelete: "cascade" }),
  subscriptionId: text("subscription_id").references(() => subscriptions.id, {
    onDelete: "set null"
  }),
  provider: paymentProviderEnum("provider").default("RAZORPAY").notNull(),
  providerPaymentId: varchar("provider_payment_id", { length: 255 }).unique(),
  providerOrderId: varchar("provider_order_id", { length: 255 }),
  amount: integer("amount").notNull(), // amount in INR rupees
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
