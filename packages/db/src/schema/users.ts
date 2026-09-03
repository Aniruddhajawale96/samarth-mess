import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { userRoleEnum, userTypeEnum, accountStatusEnum } from "./enums";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 15 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("USER").notNull(),
  userType: userTypeEnum("user_type").default("STUDENT").notNull(),
  profilePhotoUrl: text("profile_photo_url"),
  qrToken: text("qr_token").unique(),
  status: accountStatusEnum("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
