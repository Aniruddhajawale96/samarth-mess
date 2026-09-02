/**
 * MenuItemCard — displays a single menu item with image, name, description, and meal type.
 * Used on User Menu screen and Owner Menu Management.
 */
import * as React from "react";
import { cn } from "../../lib/utils";
import { MealTypeBadge } from "./MealTypeBadge";

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "EXTRA";

interface MenuItemCardProps {
  mealType: MealType;
  itemName: string;
  description?: string | null;
  image?: string | null;
  className?: string;
}

export function MenuItemCard({ mealType, itemName, description, image, className }: MenuItemCardProps) {
  return (
    <div className={cn("record", className)} style={{ alignItems: "flex-start", gap: 12, paddingTop: 12, paddingBottom: 12 }}>
      {image && (
        <img
          src={image}
          alt={itemName}
          style={{ width: 52, height: 52, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ fontWeight: 700, lineHeight: 1.3 }}>{itemName}</p>
        {description && <p className="hint">{description}</p>}
        <MealTypeBadge mealType={mealType} />
      </div>
    </div>
  );
}
