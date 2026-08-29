import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { menuStatusEnum, mealTypeEnum } from "./enums";
import { messes } from "./messes";

export const menus = pgTable("menus", {
  id: text("id").primaryKey(),
  messId: text("mess_id")
    .notNull()
    .references(() => messes.id, { onDelete: "cascade" }),
  status: menuStatusEnum("status").default("PUBLISHED").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(),
  menuId: text("menu_id")
    .notNull()
    .references(() => menus.id, { onDelete: "cascade" }),
  mealType: mealTypeEnum("meal_type").notNull(),
  itemName: text("item_name").notNull(),
  description: text("description"),
  image: text("image"),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
