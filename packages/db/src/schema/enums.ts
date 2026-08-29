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

export const mealBookingStatusEnum = pgEnum("meal_booking_status", [
  "BOOKED",
  "SKIPPED",
  "EXTRA",
  "CANCELLED"
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "ABSENT",
  "EXTRA"
]);

export const attendanceMethodEnum = pgEnum("attendance_method", ["QR", "MANUAL"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "REFUNDED"
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "RAZORPAY",
  "CASH",
  "UPI_MANUAL"
]);

export const whatsappStatusEnum = pgEnum("whatsapp_status", [
  "PENDING",
  "SENT",
  "DELIVERED",
  "FAILED"
]);
