"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect } from "react";
import { ownerApi } from "../../../../lib/api";
import { Card, CardContent, EmptyState } from "../../../../components/ui";
import { UserAvatar, StatusBadge } from "../../../../components/domain";
import Link from "next/link";

export default function AttendanceHistoryPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    ownerApi.getOwnerAttendance({ date })
      .then(res => {
        setData(res);
        setError("");
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load attendance history");
        setLoading(false);
      });
  }, [date]);

  const presentCount = data?.attendance.filter((r: any) => r.status === "PRESENT").length || 0;
  const absentCount = data?.attendance.filter((r: any) => r.status === "ABSENT").length || 0;
  const extraCount = data?.attendance.filter((r: any) => r.status === "EXTRA").length || 0;

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
      <div>
        <Link href="/owner/attendance" className="hint" style={{ fontSize: 13 }}>← Manual Attendance</Link>
        <h1 style={{ marginTop: 8 }}>Attendance History</h1>
      </div>

      <Card>
        <CardContent style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <label className="field-label" style={{ marginBottom: 0 }}>Select Date:</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </CardContent>
      </Card>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--green-soft)", borderRadius: 8 }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--green)" }}>{presentCount}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Total Present</p>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: 12, background: "#fbe5e3", borderRadius: 8 }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--red)" }}>{absentCount}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--red)" }}>Total Absent</p>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--yellow)22", borderRadius: 8 }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--yellow)" }}>{extraCount}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--yellow)" }}>Total Extra</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <EmptyState>Loading history...</EmptyState>
      ) : data?.attendance.length === 0 ? (
        <EmptyState>No attendance records found for this date.</EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data?.attendance.map((record: any) => {
            const customer = data.customers.find((c: any) => c.user.id === record.userId);
            const user = customer?.user || { name: "Unknown User", phone: "" };
            
            return (
              <Card key={record.id} style={{ borderColor: record.status === "PRESENT" ? "var(--green)" : record.status === "ABSENT" ? "var(--red)" : "var(--yellow)" }}>
                <CardContent style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <UserAvatar name={user.name} />
                    <div>
                      <p style={{ fontWeight: 700 }}>{user.name}</p>
                      <p className="hint" style={{ fontSize: 13, textTransform: "capitalize" }}>
                        {record.mealType.toLowerCase()} • {new Date(record.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    <StatusBadge status={record.status} />
                    <span style={{ fontSize: 11, background: "var(--line)", padding: "2px 6px", borderRadius: 12, fontWeight: 600 }}>
                      via {record.recordedMethod === "QR" ? "QR Scan" : "Manual"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
