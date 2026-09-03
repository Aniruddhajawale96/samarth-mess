import * as React from "react";
import Link from "next/link";
import { fetchSession } from "../../lib/auth";
import { redirect } from "next/navigation";
import { ownerApi } from "../../lib/api";
import { Card, CardHeader, CardContent, EmptyState } from "../../components/ui";
import { MoneyDisplay } from "../../components/domain";

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const session = await fetchSession();
  if (!session.isLoggedIn) redirect("/login");

  let dashboard: any = null;
  let error = "";

  try {
    const res = await ownerApi.getOwnerDashboard();
    dashboard = res;
  } catch (err: any) {
    console.error("Failed to fetch owner dashboard", err);
    error = err.message || "Failed to load dashboard data.";
  }

  if (error) {
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
        <h1>Dashboard</h1>
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
        <h1>Dashboard</h1>
        <EmptyState>Loading dashboard...</EmptyState>
      </div>
    );
  }

  const { mess, customers, today, revenue, primaryActions } = dashboard;

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">GOOD MORNING</p>
        <h1>{session.user.name}</h1>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {/* Today's Overview */}
        <Card>
          <CardHeader>
            <h2 style={{ fontSize: 16 }}>Today's Operations</h2>
            <p className="hint">Expected: {today.expectedMeals} meals</p>
          </CardHeader>
          <CardContent style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--green-soft)", borderRadius: 8 }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "var(--green)" }}>{today.present}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Present</p>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: 12, background: "#fbe5e3", borderRadius: 8 }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "var(--red)" }}>{today.absent}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--red)" }}>Absent</p>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--yellow)22", borderRadius: 8 }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "var(--yellow)" }}>{today.extra}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--yellow)" }}>Extra</p>
            </div>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardHeader>
            <h2 style={{ fontSize: 16 }}>Customers</h2>
            <p className="hint">{customers.total} Total Registered</p>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Active Subscriptions</span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{customers.active}</span>
            </div>
            
            {customers.pendingApprovals > 0 ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 8, background: "var(--yellow)22", borderRadius: 6 }}>
                <span style={{ fontWeight: 600, color: "var(--yellow)" }}>Pending Approvals</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--yellow)" }}>{customers.pendingApprovals}</span>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="hint">Pending Approvals</span>
                <span style={{ fontSize: 20, fontWeight: 800 }} className="hint">0</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader>
            <h2 style={{ fontSize: 16 }}>Revenue</h2>
            <p className="hint">Successful payments</p>
          </CardHeader>
          <CardContent style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <span style={{ fontSize: 32, fontWeight: 700 }}><MoneyDisplay amount={revenue.successfulAmount / 100} /></span>
          </CardContent>
        </Card>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <h2 style={{ fontSize: 18, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {primaryActions.includes("attendance") && (
            <Link href="/owner/attendance" className="button button-primary" style={{ textAlign: "center", padding: "16px 8px" }}>
              Take Attendance
            </Link>
          )}
          {primaryActions.includes("approvals") && (
            <Link href="/owner/approvals" className="button button-secondary" style={{ textAlign: "center", padding: "16px 8px", position: "relative" }}>
              Approvals
              {customers.pendingApprovals > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, background: "var(--red)", color: "white", borderRadius: 12, padding: "2px 6px", fontSize: 11, fontWeight: 800 }}>
                  {customers.pendingApprovals}
                </span>
              )}
            </Link>
          )}
          {primaryActions.includes("menu") && (
            <Link href="/owner/menu" className="button button-secondary" style={{ textAlign: "center", padding: "16px 8px" }}>
              Manage Menu
            </Link>
          )}
          {primaryActions.includes("customers") && (
            <Link href="/owner/customers" className="button button-secondary" style={{ textAlign: "center", padding: "16px 8px" }}>
              Customers
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
