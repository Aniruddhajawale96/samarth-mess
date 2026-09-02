"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { messesApi, subscriptionsApi } from "../../../lib/api";
import { MenuItemCard } from "../../../components/domain";

const MEAL_TIMES: Record<string, string> = {
  BREAKFAST: "8:00 – 10:00 AM",
  LUNCH: "12:30 – 2:30 PM",
  DINNER: "7:30 – 9:30 PM",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function UserMenuPage() {
  const [date, setDate] = useState(todayISO());
  const [messId, setMessId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get the user's active mess once
  useEffect(() => {
    subscriptionsApi.getMySubscriptions()
      .then(res => {
        const active = res.items.find(s => s.subscription.status === "ACTIVE");
        if (active) {
          setMessId(active.mess.id);
        } else {
          setError("You don't have an active subscription. Subscribe to a mess to view menus.");
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Failed to load subscription.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!messId) return;
    setLoading(true);
    setError("");
    messesApi.getMessMenu(messId, date)
      .then(res => {
        setItems(res.items || []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, [messId, date]);

  const grouped: Record<string, any[]> = {};
  for (const item of items) {
    if (!grouped[item.mealType]) grouped[item.mealType] = [];
    grouped[item.mealType].push(item);
  }

  const mealOrder = ["BREAKFAST", "LUNCH", "DINNER"];

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">TODAY'S</p>
        <h1>Menu</h1>
      </div>

      {/* Date navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <button
          className="button button-secondary"
          style={{ padding: "6px 14px" }}
          onClick={() => setDate(addDays(date, -1))}
        >
          ‹ Prev
        </button>
        <span style={{ fontWeight: 700 }}>{formatDate(date)}</span>
        <button
          className="button button-secondary"
          style={{ padding: "6px 14px" }}
          onClick={() => setDate(addDays(date, 1))}
        >
          Next ›
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 72, background: "var(--line)", borderRadius: 8 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <p>No menu published for {formatDate(date)}.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          {mealOrder.map(mealType => {
            const mealItems = grouped[mealType];
            if (!mealItems?.length) return null;
            return (
              <div key={mealType}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <h2 style={{ fontSize: 18, textTransform: "capitalize" }}>
                    {mealType.charAt(0) + mealType.slice(1).toLowerCase()}
                  </h2>
                  <span className="hint" style={{ fontSize: 13 }}>{MEAL_TIMES[mealType]}</span>
                </div>
                <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
                  {mealItems.map((item: any, idx: number) => (
                    <MenuItemCard
                      key={idx}
                      mealType={item.mealType}
                      itemName={item.itemName}
                      description={item.description}
                      image={item.image}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
