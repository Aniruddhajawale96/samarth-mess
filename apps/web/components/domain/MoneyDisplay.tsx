/**
 * MoneyDisplay — formats amounts using Indian digit grouping (₹1,23,456.00).
 * Constraint: performs NO arithmetic. Renders exactly the amount the backend sends.
 */
import * as React from "react";

interface MoneyDisplayProps {
  amount: number | string;
  currency?: string;
  className?: string;
}

const indianFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function MoneyDisplay({ amount, currency = "INR", className }: MoneyDisplayProps) {
  // Accept exactly what the backend sends — no arithmetic, just formatting.
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatted =
    currency === "INR"
      ? indianFormatter.format(numeric)
      : `${currency} ${numeric.toFixed(2)}`;

  return <span className={className}>{formatted}</span>;
}
