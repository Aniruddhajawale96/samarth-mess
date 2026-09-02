"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { menusApi, ownerApi } from "../../../lib/api";
import { StatusBadge } from "../../../components/domain";
import { Card, CardContent, EmptyState, Button } from "../../../components/ui";

export default function MenuHistoryPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messId, setMessId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([ownerApi.getOwnerMess(), menusApi.getOwnerMenus()])
      .then(([messRes, menuRes]) => {
        setMessId(messRes.mess.id);
        setMenus(menuRes.items);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
        <h1>Menu Management</h1>
        <EmptyState>Loading menus...</EmptyState>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p className="eyebrow">OPERATIONS</p>
          <h1>Menu History</h1>
        </div>
        <Link href={`/owner/menu/new?messId=${messId}`} className="button button-primary">
          Create New Menu
        </Link>
      </div>

      {menus.length === 0 ? (
        <EmptyState>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontWeight: 600 }}>No menus found</p>
            <p className="hint">Create your first menu to start serving meals.</p>
          </div>
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {menus.map(({ menu }: any) => {
            const dateLabel = new Date(menu.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
            const isPublished = menu.status === "PUBLISHED";
            return (
              <Card key={menu.id} style={{ borderColor: isPublished ? "var(--green)" : undefined }}>
                <CardContent style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <p style={{ fontWeight: 700, fontSize: 18 }}>{dateLabel}</p>
                      <StatusBadge status={menu.status} />
                    </div>
                    <p className="hint" style={{ fontSize: 13, marginTop: 4 }}>Last updated {new Date(menu.updatedAt).toLocaleString("en-IN")}</p>
                  </div>
                  <Link href={`/owner/menu/${menu.id}`} className="button button-secondary">
                    {menu.status === "ARCHIVED" ? "View" : "Edit"}
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
