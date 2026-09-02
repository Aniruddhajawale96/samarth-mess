/**
 * StatusBadge — maps backend status strings to the correct .status-* CSS class.
 * Covers: AccountStatus, SubscriptionStatus, PaymentStatus, BookingStatus, AttendanceStatus, MessStatus, MenuStatus.
 */
import * as React from "react";
import { cn } from "../../lib/utils";

type StatusVariant =
  // AccountStatus
  | "ACTIVE" | "DISABLED"
  // SubscriptionStatus
  | "PENDING_PAYMENT" | "PENDING_APPROVAL" | "CANCELLED" | "EXPIRED"
  // PaymentStatus
  | "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
  // BookingStatus
  | "BOOKED" | "SKIPPED" | "EXTRA"
  // AttendanceStatus
  | "PRESENT" | "ABSENT"
  // MessStatus / MenuStatus
  | "INACTIVE" | "PENDING_APPROVAL" | "PUBLISHED" | "DRAFT" | "ARCHIVED"
  | string;

const variantMap: Record<string, string> = {
  ACTIVE: "status-active",
  SUCCESS: "status-success",
  PRESENT: "status-present",
  PUBLISHED: "status-published",
  BOOKED: "status-active",

  PENDING: "status-pending",
  PENDING_PAYMENT: "status-pending",
  PENDING_APPROVAL: "status-pending",
  EXTRA: "status-extra",
  DRAFT: "status-draft",
  SKIPPED: "status-pending",

  ABSENT: "status-absent",
  FAILED: "status-failed",
  DISABLED: "status-disabled",
  CANCELLED: "status-cancelled",
  INACTIVE: "status-disabled",
  REJECTED: "status-rejected",
  EXPIRED: "status-cancelled",
  REFUNDED: "status-pending",
  ARCHIVED: "status-disabled",
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cls = variantMap[status] ?? "status-pending";
  return (
    <span className={cn("status", cls, className)}>
      {status.toLowerCase().replace(/_/g, " ")}
    </span>
  );
}
