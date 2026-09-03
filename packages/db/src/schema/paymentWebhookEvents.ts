import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const paymentWebhookEvents = pgTable("payment_webhook_events", {
  id: text("id").primaryKey(),
  providerEventId: varchar("provider_event_id", { length: 255 }).notNull().unique(),
  providerPaymentId: varchar("provider_payment_id", { length: 255 }).notNull(),
  event: varchar("event", { length: 100 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export type PaymentWebhookEvent = typeof paymentWebhookEvents.$inferSelect;
export type NewPaymentWebhookEvent = typeof paymentWebhookEvents.$inferInsert;
