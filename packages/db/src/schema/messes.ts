import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { messStatusEnum } from "./enums";
import { users } from "./users";

export const messes = pgTable("messes", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  address: text("address").notNull(),
  contact: text("contact").notNull(),
  monthlyPrice: integer("monthly_price").notNull(), // stored in INR rupees
  mealsPerDay: integer("meals_per_day").default(2).notNull(),
  skipCutoffMinutes: integer("skip_cutoff_minutes").default(120).notNull(),
  status: messStatusEnum("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type Mess = typeof messes.$inferSelect;
export type NewMess = typeof messes.$inferInsert;
