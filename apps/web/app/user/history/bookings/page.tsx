import * as React from "react";
import { bookingsApi } from "../../../../lib/api";
import { StatusBadge, MealTypeBadge } from "../../../../components/domain";
import { EmptyState } from "../../../../components/ui";
import { fetchSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function BookingsHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await fetchSession();
  if (!session.isLoggedIn) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? "1");
  let items: any[] = [];
  try {
    const res = await bookingsApi.getBookings({ page, limit: 30 });
    items = res.items;
  } catch (err) {
    console.error("Failed to fetch bookings", err);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">HISTORY</p>
        <h1>Booking History</h1>
      </div>

      {items.length === 0 ? (
        <EmptyState>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3>No bookings yet.</h3>
            <p className="muted">Your meal booking history will appear here.</p>
          </div>
        </EmptyState>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          {items.map((booking: any, idx: number) => (
            <div
              key={booking.id}
              className="record"
              style={{ borderTop: idx === 0 ? "none" : "1px solid var(--line)", padding: "14px 16px" }}
            >
              <div style={{ display: "grid", gap: 4 }}>
                <p style={{ fontWeight: 600 }}>{formatDate(booking.date)}</p>
                <MealTypeBadge mealType={booking.mealType} />
              </div>
              <StatusBadge status={booking.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
