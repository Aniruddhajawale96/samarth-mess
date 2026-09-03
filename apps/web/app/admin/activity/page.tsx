"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect } from "react";
import { adminApi } from "../../../lib/api";
import { type AuditEvent } from "../../../lib/api/admin";
import { EmptyState } from "../../../components/ui";

export default function AdminActivityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [filterAction, setFilterAction] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchAudit = () => {
    setLoading(true);
    adminApi.getAuditLogs(100) // fetch up to 100 for client-side filtering
      .then(res => { setData(res); setError(""); setLoading(false); })
      .catch((err: any) => { setError(err.message || "Failed to load activity logs"); setLoading(false); });
  };

  useEffect(() => { fetchAudit(); }, []);

  const logs = data?.items || [];
  
  // Client-side filtering (since backend only takes limit)
  const filteredLogs = logs.filter((log: AuditEvent) => {
    if (filterAction && !log.action.includes(filterAction)) return false;
    if (filterType && log.entityType !== filterType) return false;
    return true;
  });

  const getActionColor = (action: string) => {
    if (action.includes("APPROVED") || action.includes("ACTIVE") || action.includes("SUCCESS")) return "var(--green)";
    if (action.includes("REJECTED") || action.includes("DISABLED") || action.includes("FAIL")) return "var(--red)";
    if (action.includes("UPDATE")) return "var(--primary)";
    return "var(--ink)";
  };

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 1000 }}>
      <div>
        <p className="eyebrow">PLATFORM</p>
        <h1>Audit Log</h1>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: 16, background: "var(--card)", borderRadius: 12, border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label className="hint" style={{ fontSize: 13, fontWeight: 600 }}>Entity Type:</label>
          <select className="input" style={{ padding: "6px 12px", fontSize: 13 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="USER">User</option>
            <option value="MESS">Mess</option>
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="PAYMENT">Payment</option>
          </select>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label className="hint" style={{ fontSize: 13, fontWeight: 600 }}>Action:</label>
          <select className="input" style={{ padding: "6px 12px", fontSize: 13 }} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
            <option value="">All Actions</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DISABLED">Disabled</option>
            <option value="ACTIVE">Activated</option>
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && !data ? (
        <EmptyState>Loading audit logs...</EmptyState>
      ) : filteredLogs.length === 0 ? (
        <EmptyState>No activity matches your filters.</EmptyState>
      ) : (
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", background: "var(--card)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", gap: 16, padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--line)", fontWeight: 700, fontSize: 13, color: "var(--muted)" }}>
            <div>TIMESTAMP</div>
            <div>ACTION</div>
            <div>ACTOR</div>
            <div>ENTITY</div>
            <div>DETAILS</div>
          </div>
          
          <div style={{ display: "grid" }}>
            {filteredLogs.map((log: AuditEvent, index: number) => (
              <div key={log.id} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", gap: 16, padding: "16px", borderBottom: index < filteredLogs.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center", fontSize: 14 }}>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  {new Date(log.createdAt).toLocaleString("en-IN", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
                
                <div style={{ fontWeight: 600, color: getActionColor(log.action) }}>
                  {log.action}
                </div>
                
                <div>
                  <span style={{ fontSize: 12, background: "var(--line)", padding: "2px 6px", borderRadius: 4, fontWeight: 600, display: "inline-block", marginBottom: 2 }}>
                    {log.actorRole}
                  </span>
                  <div className="hint" style={{ fontSize: 12, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {log.actorId}
                  </div>
                </div>
                
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{log.entityType}</span>
                  <div className="hint" style={{ fontSize: 12, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {log.entityId}
                  </div>
                </div>
                
                <div>
                  {log.metadata ? (
                    <button className="button button-secondary" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => alert(JSON.stringify(log.metadata, null, 2))}>
                      View Metadata
                    </button>
                  ) : (
                    <span className="hint" style={{ fontSize: 12 }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
