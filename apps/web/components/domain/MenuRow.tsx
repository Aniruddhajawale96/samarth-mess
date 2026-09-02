import * as React from "react";
import { MealTypeBadge } from "./MealTypeBadge";

interface MenuRowProps {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "EXTRA";
  itemName: string;
  description?: string | null;
  className?: string;
}

export function MenuRow({ mealType, itemName, description, className }: MenuRowProps) {
  return (
    <div className={`menu-row${className ? ` ${className}` : ""}`}>
      <MealTypeBadge mealType={mealType} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 650 }}>{itemName}</p>
        {description && <p className="hint">{description}</p>}
      </div>
    </div>
  );
}
