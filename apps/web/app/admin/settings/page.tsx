"use client";

import * as React from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui";
import { StatusBadge } from "../../../components/domain";

export default function AdminSettingsPage() {
  // Static status indicators as requested by PRD.
  // NEVER render actual secrets (API keys, JWT secrets, etc.) to the client.
  const providers = [
    { name: "PostgreSQL Database", status: "ACTIVE", type: "Storage" },
    { name: "Redis Cache", status: "ACTIVE", type: "Storage" },
    { name: "Razorpay (Payments)", status: "ACTIVE", type: "Integration" },
    { name: "WhatsApp Business API", status: "PENDING_APPROVAL", type: "Integration", note: "Pending meta verification" },
  ];

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800 }}>
      <div>
        <p className="eyebrow">PLATFORM</p>
        <h1>Settings & Providers</h1>
      </div>

      <div style={{ padding: 16, background: "#fbe5e3", border: "1px solid var(--red)", borderRadius: 8, color: "var(--red)" }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>Security Notice</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>
          Environment secrets, API keys, and connection strings are managed entirely via server infrastructure 
          and environment variables. They will never be exposed or editable through this web interface.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2>System Status</h2>
        </CardHeader>
        <CardContent>
          <div style={{ display: "grid", gap: 16 }}>
            {providers.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: i < providers.length - 1 ? "1px solid var(--line)" : "none" }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{p.name}</p>
                  <p className="hint" style={{ fontSize: 13, marginTop: 2 }}>{p.type}</p>
                  {p.note && <p style={{ fontSize: 12, color: "var(--yellow)", fontWeight: 600, marginTop: 4 }}>{p.note}</p>}
                </div>
                <div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2>Platform Configuration</h2>
        </CardHeader>
        <CardContent>
          <p className="hint" style={{ fontSize: 14, marginBottom: 16 }}>
            Global platform settings are currently locked in this environment.
          </p>
          <div style={{ display: "grid", gap: 12, opacity: 0.6, pointerEvents: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Allow new Owner registrations</span>
              <input type="checkbox" checked readOnly style={{ accentColor: "var(--primary)", width: 18, height: 18 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Require Admin approval for Messes</span>
              <input type="checkbox" checked readOnly style={{ accentColor: "var(--primary)", width: 18, height: 18 }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
