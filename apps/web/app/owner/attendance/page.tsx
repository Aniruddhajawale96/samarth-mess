"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect } from "react";
import { ownerApi } from "../../../lib/api";
import { type AttendanceBatchRecord } from "../../../lib/api/owner";
import { Card, CardContent, Button, EmptyState } from "../../../components/ui";
import Link from "next/link";
import { UserAvatar } from "../../../components/domain";

export default function OwnerAttendancePage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mealType, setMealType] = useState<"BREAKFAST" | "LUNCH" | "DINNER">("LUNCH");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const [batch, setBatch] = useState<Record<string, "PRESENT" | "ABSENT" | "EXTRA">>({});

  const fetchAttendance = async (targetDate: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await ownerApi.getOwnerAttendance({ date: targetDate });
      setData(res);
      
      // Initialize batch state from existing attendance records for the selected mealType
      const newBatch: Record<string, "PRESENT" | "ABSENT" | "EXTRA"> = {};
      res.attendance.forEach(record => {
        if (record.mealType === mealType) {
          newBatch[record.userId] = record.status;
        }
      });
      setBatch(newBatch);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(date);
  }, [date, mealType]);

  const handleMark = (userId: string, status: "PRESENT" | "ABSENT" | "EXTRA") => {
    setBatch(prev => ({ ...prev, [userId]: status }));
  };

  const handleSave = async () => {
    if (!data?.mess) return;
    setSaving(true);
    setError("");

    const recordsToSave: AttendanceBatchRecord[] = Object.entries(batch).map(([userId, status]) => ({
      userId,
      mealType,
      status
    }));

    try {
      await ownerApi.markManualAttendance({
        messId: data.mess.id,
        date,
        records: recordsToSave,
      });
      alert("Attendance saved successfully");
    } catch (err: any) {
      setError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(batch).filter(s => s === "PRESENT").length;
  const absentCount = Object.values(batch).filter(s => s === "ABSENT").length;
  const extraCount = Object.values(batch).filter(s => s === "EXTRA").length;

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto", paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="eyebrow">DAILY OPERATIONS</p>
          <h1>Manual Attendance</h1>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/owner/attendance/history" className="button button-secondary">History</Link>
          <Link href="/owner/attendance/scan" className="button button-primary" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>📷</span> Scan QR
          </Link>
        </div>
      </div>

      <Card>
        <CardContent style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="field-label">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="field-label">Meal</label>
            <select
              className="input"
              value={mealType}
              onChange={e => setMealType(e.target.value as any)}
              style={{ width: "100%" }}
            >
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--green-soft)", borderRadius: 8 }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--green)" }}>{presentCount}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Present</p>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: 12, background: "#fbe5e3", borderRadius: 8 }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--red)" }}>{absentCount}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--red)" }}>Absent</p>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--yellow)22", borderRadius: 8 }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--yellow)" }}>{extraCount}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--yellow)" }}>Extra</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <EmptyState>Loading customers...</EmptyState>
      ) : data?.customers.length === 0 ? (
        <EmptyState>No active customers for this date.</EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data?.customers.map(({ user, subscription }: any) => {
            const currentStatus = batch[user.id];
            return (
              <Card key={user.id} style={{ borderColor: currentStatus === "PRESENT" ? "var(--green)" : currentStatus === "ABSENT" ? "var(--red)" : currentStatus === "EXTRA" ? "var(--yellow)" : undefined }}>
                <CardContent style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <UserAvatar name={user.name} />
                    <div>
                      <p style={{ fontWeight: 700 }}>{user.name}</p>
                      <p className="hint" style={{ fontSize: 13 }}>{user.phone} • Plan: {subscription.planType}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      variant={currentStatus === "PRESENT" ? "primary" : "secondary"}
                      onClick={() => handleMark(user.id, "PRESENT")}
                      style={{ padding: "8px 12px", background: currentStatus === "PRESENT" ? "var(--green)" : undefined, borderColor: currentStatus === "PRESENT" ? "var(--green)" : undefined }}
                    >
                      Present
                    </Button>
                    <Button
                      variant={currentStatus === "ABSENT" ? "primary" : "secondary"}
                      onClick={() => handleMark(user.id, "ABSENT")}
                      style={{ padding: "8px 12px", background: currentStatus === "ABSENT" ? "var(--red)" : undefined, borderColor: currentStatus === "ABSENT" ? "var(--red)" : undefined }}
                    >
                      Absent
                    </Button>
                    <Button
                      variant={currentStatus === "EXTRA" ? "primary" : "secondary"}
                      onClick={() => handleMark(user.id, "EXTRA")}
                      style={{ padding: "8px 12px", background: currentStatus === "EXTRA" ? "var(--yellow)" : undefined, borderColor: currentStatus === "EXTRA" ? "var(--yellow)" : undefined, color: currentStatus === "EXTRA" ? "#fff" : undefined }}
                    >
                      Extra
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data?.customers.length > 0 && (
        <div style={{ position: "fixed", bottom: 24, left: 0, right: 0, padding: "0 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Button
              variant="primary"
              style={{ width: "100%", padding: 16, fontSize: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
