import { relations } from "drizzle-orm";
import { users } from "./users";
import { messes } from "./messes";
import { subscriptions } from "./subscriptions";
import { menus, menuItems } from "./menus";

export const usersRelations = relations(users, ({ many }) => ({
  ownedMesses: many(messes),
  subscriptions: many(subscriptions)
}));

export const messesRelations = relations(messes, ({ one, many }) => ({
  owner: one(users, {
    fields: [messes.ownerId],
    references: [users.id]
  }),
  subscriptions: many(subscriptions),
  menus: many(menus)
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  }),
  mess: one(messes, {
    fields: [subscriptions.messId],
    references: [messes.id]
  })
}));

export const menusRelations = relations(menus, ({ one, many }) => ({
  mess: one(messes, {
    fields: [menus.messId],
    references: [messes.id]
  }),
  items: many(menuItems)
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  menu: one(menus, {
    fields: [menuItems.menuId],
    references: [menus.id]
  })
}));
