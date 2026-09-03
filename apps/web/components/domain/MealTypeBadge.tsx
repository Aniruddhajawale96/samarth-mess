import * as React from "react";
import { cn } from "../../lib/utils";

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "EXTRA";

const mealConfig: Record<MealType, { label: string; color: string }> = {
  BREAKFAST: { label: "Breakfast", color: "var(--yellow)" },
  LUNCH: { label: "Lunch", color: "var(--green)" },
  DINNER: { label: "Dinner", color: "var(--orange)" },
  EXTRA: { label: "Extra", color: "var(--muted)" },
};

interface MealTypeBadgeProps {
  mealType: MealType;
  className?: string;
}

export function MealTypeBadge({ mealType, className }: MealTypeBadgeProps) {
  const config = mealConfig[mealType] ?? { label: mealType, color: "var(--muted)" };
  return (
    <span
      className={cn("status", className)}
      style={{ background: `${config.color}22`, color: config.color }}
    >
      {config.label}
    </span>
  );
}
