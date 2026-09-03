import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { whatsappStatusEnum } from "./enums";
import { payments } from "./payments";

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id")
    .notNull()
    .unique()
    .references(() => payments.id, { onDelete: "cascade" }),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  fileUrl: text("file_url"),
  whatsappStatus: whatsappStatusEnum("whatsapp_status").default("PENDING").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
