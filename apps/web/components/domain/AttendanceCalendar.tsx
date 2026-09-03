/**
 * AttendanceCalendar — monthly grid showing daily attendance status per meal.
 * Used on Owner Attendance and User Attendance History screens.
 * Styled from globals.css tokens only.
 */
import * as React from "react";
import { cn } from "../../lib/utils";
import { StatusBadge } from "./StatusBadge";

export interface AttendanceDayRecord {
  date: string; // YYYY-MM-DD
  status: "PRESENT" | "ABSENT" | "EXTRA";
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
}

interface AttendanceCalendarProps {
  records: AttendanceDayRecord[];
  month: string; // YYYY-MM, e.g. "2026-08"
  onSelectDate?: (date: string) => void;
  selectedDate?: string;
  className?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function AttendanceCalendar({
  records,
  month,
  onSelectDate,
  selectedDate,
  className,
}: AttendanceCalendarProps) {
  const [year, mon] = month.split("-").map(Number);
  const totalDays = daysInMonth(year, mon - 1);
  const firstDow = new Date(year, mon - 1, 1).getDay();

  // Build a map: date → most important status (PRESENT > EXTRA > ABSENT)
  const statusMap = new Map<string, AttendanceDayRecord["status"]>();
  const order = { PRESENT: 2, EXTRA: 1, ABSENT: 0 };
  for (const r of records) {
    const existing = statusMap.get(r.date);
    if (existing === undefined || order[r.status] > order[existing]) {
      statusMap.set(r.date, r.status);
    }
  }

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className={cn("panel", className)}>
      <div className="panel-header">
        <h2 style={{ fontSize: 14, fontWeight: 700 }}>
          {new Date(year, mon - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </h2>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--muted)", padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const status = statusMap.get(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === new Date().toISOString().slice(0, 10);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate?.(dateStr)}
              title={status ?? "No record"}
              style={{
                borderRadius: 6,
                padding: "6px 2px",
                fontSize: 12,
                fontWeight: isToday ? 800 : 500,
                border: isSelected ? "2px solid var(--green)" : "2px solid transparent",
                background: status === "PRESENT"
                  ? "var(--green-soft)"
                  : status === "ABSENT"
                  ? "#fbe5e3"
                  : status === "EXTRA"
                  ? "#fff3d8"
                  : "transparent",
                color: status === "PRESENT"
                  ? "var(--green)"
                  : status === "ABSENT"
                  ? "var(--red)"
                  : status === "EXTRA"
                  ? "var(--yellow)"
                  : "var(--ink)",
                cursor: onSelectDate ? "pointer" : "default",
                textAlign: "center",
                lineHeight: 1,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <StatusBadge status="PRESENT" />
        <StatusBadge status="ABSENT" />
        <StatusBadge status="EXTRA" />
      </div>
    </div>
  );
}
