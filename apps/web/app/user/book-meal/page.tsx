"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect } from "react";
import { subscriptionsApi, bookingsApi, messesApi } from "../../../lib/api";
import { ApiError } from "../../../lib/api/client";
import { MealCard } from "../../../components/domain";

type MealType = "BREAKFAST" | "LUNCH" | "DINNER";
const MEALS: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function BookMealPage() {
  const [date, setDate] = useState(todayISO());
  const [messId, setMessId] = useState<string | null>(null);
  const [skipCutoff, setSkipCutoff] = useState<number>(30);
  const [bookings, setBookings] = useState<Record<MealType, any>>({} as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<MealType | "extra" | null>(null);
  const [toast, setToast] = useState("");

  // Load active mess
  useEffect(() => {
    subscriptionsApi.getMySubscriptions()
      .then(async res => {
        const active = res.items.find(s => s.subscription.status === "ACTIVE");
        if (!active) {
          setError("You don't have an active subscription.");
          setLoading(false);
          return;
        }
        setMessId(active.mess.id);
        // Get mess skip cutoff
        try {
          const m = await messesApi.getMess(active.mess.id);
          // skipCutoffMinutes may not be on public mess, default 30
        } catch {}
      })
      .catch(() => {
        setError("Failed to load subscription.");
        setLoading(false);
      });
  }, []);

  // Load bookings for date+mess
  useEffect(() => {
    if (!messId) return;
    setLoading(true);
    bookingsApi.getBookings({ date })
      .then(res => {
        const map: Record<string, any> = {};
        for (const b of res.items) {
          if (b.date === date) map[b.mealType] = b;
        }
        setBookings(map as any);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [messId, date]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleBook(mealType: MealType) {
    if (!messId) return;
    setSaving(mealType);
    try {
      const res = await bookingsApi.createBooking({ messId, date, mealType, status: "BOOKED" });
      setBookings(prev => ({ ...prev, [mealType]: res.booking }));
      showToast("Meal booked.");
    } catch (err: any) {
      showToast(err.message || "Failed to book meal.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSkip(mealType: MealType) {
    if (!messId) return;
    setSaving(mealType);
    try {
      const existing = bookings[mealType];
      let res;
      if (existing) {
        res = await bookingsApi.updateBooking(existing.id, "SKIPPED");
      } else {
        res = await bookingsApi.createBooking({ messId, date, mealType, status: "SKIPPED" });
      }
      setBookings(prev => ({ ...prev, [mealType]: res.booking }));
      showToast("Meal skipped.");
    } catch (err: any) {
      showToast(err.message || "Failed to skip meal.");
    } finally {
      setSaving(null);
    }
  }

  async function handleExtraMeal() {
    if (!messId) return;
    setSaving("extra");
    try {
      const res = await bookingsApi.bookExtraMeal({ messId, date, mealType: "LUNCH" });
      showToast("Extra meal added.");
    } catch (err: any) {
      showToast(err.message || "Failed to add extra meal.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 50,
          background: "var(--ink)", color: "white",
          padding: "10px 18px", borderRadius: 8, fontSize: 14
        }}>
          {toast}
        </div>
      )}

      <div>
        <p className="eyebrow">BOOKINGS</p>
        <h1>Book Meal</h1>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label className="field-label" htmlFor="date" style={{ margin: 0 }}>Date</label>
        <input
          id="date"
          type="date"
          className="input"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <p className="hint" style={{ fontSize: 13 }}>
        Selected: <strong>{formatDate(date)}</strong>
      </p>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 64, background: "var(--line)", borderRadius: 8 }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {MEALS.map(mealType => {
            const booking = bookings[mealType];
            // Server-reported status is authoritative. If status is BOOKED or SKIPPED,
            // we reflect that. We do NOT decide lock by browser clock.
            const status = booking?.status;
            const isLocked = status === "BOOKED" || status === "EXTRA";

            return (
              <MealCard
                key={mealType}
                mealType={mealType}
                date={date}
                status={status}
                locked={saving === mealType}
                onBook={!isLocked ? () => handleBook(mealType) : undefined}
                onSkip={!isLocked && status !== "SKIPPED" ? () => handleSkip(mealType) : undefined}
              />
            );
          })}

          <div className="panel" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 600 }}>Extra Meal</p>
              <p className="hint" style={{ fontSize: 12 }}>Book an extra meal for today</p>
            </div>
            <button
              className="button button-secondary"
              style={{ padding: "6px 14px", fontSize: 13 }}
              onClick={handleExtraMeal}
              disabled={saving === "extra"}
            >
              {saving === "extra" ? "Adding…" : "+ Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
