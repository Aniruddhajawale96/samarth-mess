"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "../../lib/api";
import { Card, CardHeader, CardContent } from "../../components/ui";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      adminApi.getAdminDashboard(),
      adminApi.getAuditLogs(10),
    ])
      .then(([dash, auditRes]) => {
        setData(dash);
        setAudit(auditRes.items);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load dashboard");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <h1>Admin Dashboard</h1>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: 80, background: "var(--line)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <h1>Admin Dashboard</h1>
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  const stats = [
    { label: "Active Users", value: data?.users ?? 0, href: "/admin/users?role=USER", color: "var(--primary)" },
    { label: "Active Owners", value: data?.owners ?? 0, href: "/admin/owners", color: "var(--green)" },
    { label: "Total Messes", value: data?.messes ?? 0, href: "/admin/owners", color: "var(--ink)" },
    { label: "Pending Approvals", value: data?.pendingMesses ?? 0, href: "/admin/owners?status=PENDING_APPROVAL", color: data?.pendingMesses > 0 ? "var(--yellow)" : "var(--muted)" },
  ];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="eyebrow">PLATFORM</p>
        <h1>Admin Dashboard</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {stats.map(({ label, value, href, color }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <Card style={{ cursor: "pointer" }}>
              <CardContent style={{ display: "grid", gap: 4, padding: 20 }}>
                <p style={{ fontSize: 32, fontWeight: 800, color }}>{value}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2>Recent Activity</h2>
          <Link href="/admin/activity" className="hint" style={{ fontSize: 13 }}>View All →</Link>
        </div>

        {audit.length === 0 ? (
          <p className="hint">No recent activity recorded.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {audit.map((event: any) => (
              <div key={event.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "var(--card)", borderRadius: 8, border: "1px solid var(--line)" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{event.action}</span>
                  <span className="hint" style={{ fontSize: 12, marginLeft: 8 }}>on {event.entityType} {event.entityId.slice(0, 8)}…</span>
                </div>
                <span className="hint" style={{ fontSize: 12 }}>
                  {new Date(event.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
