"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ownerApi } from "../../../lib/api";
import { Card, CardHeader, CardContent, EmptyState, ErrorState } from "../../../components/ui";
import { MoneyDisplay, StatusBadge } from "../../../components/domain";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function OwnerPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = React.use(searchParams);
  const page = parseInt(params.page ?? "1");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = () => {
    setLoading(true);
    ownerApi.getOwnerPayments({ page, limit: 20 })
      .then(res => { setData(res); setError(""); setLoading(false); })
      .catch((err: any) => { setError(err.message || "Failed to load payments"); setLoading(false); });
  };

  useEffect(() => { fetchPayments(); }, [page]);

  if (error) {
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
        <h1>Payments Overview</h1>
        <ErrorState message={error} onRetry={fetchPayments} />
      </div>
    );
  }

  const formatCurrency = (paisa: number) => paisa / 100;

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">FINANCES</p>
        <h1>Payments Overview</h1>
      </div>

      {loading && !data ? (
        <div style={{ display: "grid", gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 100, background: "var(--line)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />)}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <Card>
              <CardHeader>
                <h2 style={{ fontSize: 15 }}>Today's Collected</h2>
                <p className="hint">Successful payments today</p>
              </CardHeader>
              <CardContent>
                <span style={{ fontSize: 32, fontWeight: 800 }}>
                  <MoneyDisplay amount={formatCurrency(data?.totals?.todayCollected ?? 0)} />
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 style={{ fontSize: 15 }}>This Month</h2>
                <p className="hint">Successful payments this month</p>
              </CardHeader>
              <CardContent>
                <span style={{ fontSize: 32, fontWeight: 800 }}>
                  <MoneyDisplay amount={formatCurrency(data?.totals?.monthCollected ?? 0)} />
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 style={{ fontSize: 15 }}>Pending</h2>
                <p className="hint">Payments yet to complete</p>
              </CardHeader>
              <CardContent>
                <span style={{ fontSize: 32, fontWeight: 800, color: "var(--yellow)" }}>
                  <MoneyDisplay amount={formatCurrency(data?.totals?.pending ?? 0)} />
                </span>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 style={{ marginBottom: 12 }}>Payment History</h2>
            
            {data?.items?.length === 0 ? (
              <EmptyState>No payments found.</EmptyState>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {data?.items?.map((item: any) => (
                  <Card key={item.providerReference || item.date}>
                    <CardContent style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontWeight: 600 }}>{item.user.name}</span>
                        <span className="hint" style={{ fontSize: 13 }}>
                          {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>Ref: {item.providerReference || "N/A"}</span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 18, fontWeight: 700 }}>
                          <MoneyDisplay amount={formatCurrency(item.amount)} />
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {data && data.items.length === data.limit && (
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
                {page > 1 && (
                  <Link href={`/owner/payments?page=${page - 1}`} className="button button-secondary">
                    Previous
                  </Link>
                )}
                <Link href={`/owner/payments?page=${page + 1}`} className="button button-secondary">
                  Next
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
