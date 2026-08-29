import { relations } from "drizzle-orm";
import { users } from "./users";
import { messes } from "./messes";
import { subscriptions } from "./subscriptions";
import { menus, menuItems } from "./menus";
import { mealBookings } from "./mealBookings";
import { attendance } from "./attendance";
import { payments } from "./payments";
import { invoices } from "./invoices";

export const usersRelations = relations(users, ({ many }) => ({
  ownedMesses: many(messes),
  subscriptions: many(subscriptions),
  mealBookings: many(mealBookings),
  attendanceRecords: many(attendance),
  payments: many(payments)
}));

export const messesRelations = relations(messes, ({ one, many }) => ({
  owner: one(users, {
    fields: [messes.ownerId],
    references: [users.id]
  }),
  subscriptions: many(subscriptions),
  menus: many(menus),
  mealBookings: many(mealBookings),
  attendanceRecords: many(attendance),
  payments: many(payments)
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  }),
  mess: one(messes, {
    fields: [subscriptions.messId],
    references: [messes.id]
  }),
  payments: many(payments)
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

export const mealBookingsRelations = relations(mealBookings, ({ one }) => ({
  user: one(users, {
    fields: [mealBookings.userId],
    references: [users.id]
  }),
  mess: one(messes, {
    fields: [mealBookings.messId],
    references: [messes.id]
  })
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id]
  }),
  mess: one(messes, {
    fields: [attendance.messId],
    references: [messes.id]
  }),
  marker: one(users, {
    fields: [attendance.markedBy],
    references: [users.id]
  })
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id]
  }),
  mess: one(messes, {
    fields: [payments.messId],
    references: [messes.id]
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id]
  }),
  invoice: one(invoices, {
    fields: [payments.id],
    references: [invoices.paymentId]
  })
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  payment: one(payments, {
    fields: [invoices.paymentId],
    references: [payments.id]
  })
}));
