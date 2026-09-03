import * as React from "react";
import Link from "next/link";
import { fetchSession } from "../../lib/auth";
import { subscriptionsApi, messesApi } from "../../lib/api";
import { StatusBadge, MoneyDisplay, MenuRow } from "../../components/domain";
import { Card, CardHeader, CardContent, Button, EmptyState } from "../../components/ui";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function UserDashboardPage() {
  const session = await fetchSession();
  if (!session.isLoggedIn) redirect("/login");

  // Fetch subscriptions
  let subs: Array<{ subscription: any; mess: any }> = [];
  try {
    const res = await subscriptionsApi.getMySubscriptions();
    subs = res.items;
  } catch (err) {
    console.error("Failed to fetch subscriptions", err);
  }

  // Active or Pending Approval subscription
  const currentSub = subs.find((s) => s.subscription.status === "ACTIVE") || 
                     subs.find((s) => s.subscription.status === "PENDING_APPROVAL");

  // If no subscription, show Find a Mess CTA
  if (!currentSub) {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div>
          <p className="eyebrow">GOOD MORNING</p>
          <h1>{session.user.name}</h1>
        </div>
        <EmptyState>
          <div style={{ display: "grid", gap: 12, placeItems: "center" }}>
            <h2>You don't have an active mess plan.</h2>
            <p className="muted">Find a mess and subscribe to start booking meals.</p>
            <Link href="/user/messes" className="button button-primary">Find a Mess</Link>
          </div>
        </EmptyState>
      </div>
    );
  }

  const { subscription, mess } = currentSub;
  const isActive = subscription.status === "ACTIVE";

  // If active, fetch today's menu
  let menuPreview: any[] = [];
  if (isActive) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await messesApi.getMess(mess.id, today);
      menuPreview = res.menuPreview || [];
    } catch (err) {
      console.error("Failed to fetch mess menu", err);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">GOOD MORNING</p>
        <h1>{session.user.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: 18 }}>{mess.name}</h2>
              <p className="hint">Your Plan</p>
            </div>
            <StatusBadge status={subscription.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <MoneyDisplay amount={mess.monthlyPrice} className="text-xl font-bold" />
          </div>
          
          {!isActive && subscription.status === "PENDING_APPROVAL" && (
            <div style={{ marginTop: 16, padding: 12, background: "var(--yellow)22", borderRadius: 8 }}>
              <p style={{ fontWeight: 600, color: "var(--yellow)" }}>Payment received</p>
              <p className="hint">Waiting for mess owner approval.</p>
            </div>
          )}

          {isActive && (
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <Link href="/user/book-meal" className="button button-primary" style={{ flex: 1, textAlign: "center" }}>
                Book Meal
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {isActive && (
        <div style={{ display: "grid", gap: 16 }}>
          <h2 style={{ fontSize: 18, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>Today's Menu</h2>
          {menuPreview.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {menuPreview.map((item, idx) => (
                <MenuRow
                  key={idx}
                  mealType={item.mealType}
                  itemName={item.itemName}
                  description={item.description}
                />
              ))}
            </div>
          ) : (
            <p className="hint">No menu published for today.</p>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        <h2 style={{ fontSize: 18, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Link href="/user/qr" className="button button-secondary" style={{ textAlign: "center" }}>My QR</Link>
          <Link href="/user/history/payments" className="button button-secondary" style={{ textAlign: "center" }}>Payments</Link>
          <Link href="/user/history/bookings" className="button button-secondary" style={{ textAlign: "center" }}>History</Link>
          <Link href="/user/profile" className="button button-secondary" style={{ textAlign: "center" }}>Profile</Link>
        </div>
      </div>
    </div>
  );
}
