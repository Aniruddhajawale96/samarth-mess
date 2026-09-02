import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "active" | "success" | "present" | "published" | "pending" | "extra" | "draft" | "absent" | "failed" | "disabled" | "rejected" | "cancelled" | "default";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "status",
        variant === "active" && "status-active",
        variant === "success" && "status-success",
        variant === "present" && "status-present",
        variant === "published" && "status-published",
        (variant === "pending" || variant === "draft" || variant === "extra") && "status-pending",
        (variant === "absent" || variant === "failed" || variant === "disabled" || variant === "rejected" || variant === "cancelled") && "status-absent",
        className
      )}
      {...props}
    />
  );
}
