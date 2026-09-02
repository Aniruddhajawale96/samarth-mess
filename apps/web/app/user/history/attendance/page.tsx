import * as React from "react";
import { attendanceApi } from "../../../../lib/api";
import { StatusBadge, MealTypeBadge } from "../../../../components/domain";
import { EmptyState } from "../../../../components/ui";
import { fetchSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AttendanceHistoryPage() {
  const session = await fetchSession();
  if (!session.isLoggedIn) redirect("/login");

  let items: any[] = [];
  try {
    const res = await attendanceApi.getMyAttendance();
    items = res.items;
  } catch (err) {
    console.error("Failed to fetch attendance", err);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">HISTORY</p>
        <h1>Attendance</h1>
      </div>

      {items.length === 0 ? (
        <EmptyState>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3>No attendance records yet.</h3>
            <p className="muted">Your attendance will appear here after meals.</p>
          </div>
        </EmptyState>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          {items.map((record: any, idx: number) => (
            <div
              key={record.id}
              className="record"
              style={{ borderTop: idx === 0 ? "none" : "1px solid var(--line)", padding: "14px 16px" }}
            >
              <div style={{ display: "grid", gap: 4 }}>
                <p style={{ fontWeight: 600 }}>{formatDate(record.date)}</p>
                <MealTypeBadge mealType={record.mealType} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <StatusBadge status={record.status} />
                <span className="hint" style={{ fontSize: 11 }}>{record.method}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
