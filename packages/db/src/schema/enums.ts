import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["USER", "OWNER", "ADMIN"]);
export const userTypeEnum = pgEnum("user_type", ["STUDENT", "PROFESSIONAL"]);
export const accountStatusEnum = pgEnum("account_status", ["ACTIVE", "DISABLED"]);

export const messStatusEnum = pgEnum("mess_status", [
  "ACTIVE",
  "INACTIVE",
  "PENDING_APPROVAL"
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "PENDING_PAYMENT",
  "PENDING_APPROVAL",
  "ACTIVE",
  "REJECTED",
  "EXPIRED",
  "CANCELLED"
]);

export const menuStatusEnum = pgEnum("menu_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const mealTypeEnum = pgEnum("meal_type", ["BREAKFAST", "LUNCH", "DINNER"]);
