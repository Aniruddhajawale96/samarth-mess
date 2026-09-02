/**
 * MealCard — displays a meal booking card with status and actions.
 * Used on User Home and Book Meal screen.
 */
import * as React from "react";
import { cn } from "../../lib/utils";
import { MealTypeBadge } from "./MealTypeBadge";
import { StatusBadge } from "./StatusBadge";

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "EXTRA";
type BookingStatus = "BOOKED" | "SKIPPED" | "EXTRA" | "CANCELLED";

interface MealCardProps {
  mealType: MealType;
  date: string;
  status?: BookingStatus;
  locked?: boolean;
  onBook?: () => void;
  onSkip?: () => void;
  className?: string;
}

const mealTimes: Record<string, string> = {
  BREAKFAST: "8:00 – 10:00 AM",
  LUNCH: "12:30 – 2:30 PM",
  DINNER: "7:30 – 9:30 PM",
  EXTRA: "Anytime",
};

export function MealCard({ mealType, status, locked, onBook, onSkip, className }: MealCardProps) {
  return (
    <div className={cn("panel", className)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <MealTypeBadge mealType={mealType} />
        <p className="hint">{mealTimes[mealType] ?? ""}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {status ? (
          <StatusBadge status={status} />
        ) : locked ? (
          <span className="hint">Locked</span>
        ) : (
          <>
            {onBook && (
              <button className="button button-primary" style={{ padding: "6px 14px", minHeight: 34, fontSize: 13 }} onClick={onBook}>
                Book
              </button>
            )}
            {onSkip && (
              <button className="button button-secondary" style={{ padding: "6px 14px", minHeight: 34, fontSize: 13 }} onClick={onSkip}>
                Skip
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
