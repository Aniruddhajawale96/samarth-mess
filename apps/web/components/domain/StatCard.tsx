/**
 * StatCard — uses the .metric CSS class for dashboards.
 */
import * as React from "react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={cn("metric", className)}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
