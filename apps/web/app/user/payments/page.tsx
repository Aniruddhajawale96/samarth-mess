import * as React from "react";
import Link from "next/link";
import { paymentsApi } from "../../../lib/api";
import { StatusBadge, MoneyDisplay } from "../../../components/domain";
import { EmptyState, Card } from "../../../components/ui";
import { fetchSession } from "../../../lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await fetchSession();
  if (!session.isLoggedIn) redirect("/login");

  const { page: pageParam } = await searchParams;
  let items: any[] = [];
  let page = parseInt(pageParam ?? "1");

  try {
    const res = await paymentsApi.getPayments({ page, limit: 20 });
    items = res.items;
  } catch (err) {
    console.error("Failed to fetch payments", err);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">BILLING</p>
        <h1>Payments</h1>
      </div>

      {items.length === 0 ? (
        <EmptyState>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3>No payments yet.</h3>
            <p className="muted">Your payment history will appear here.</p>
          </div>
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map(({ payment, mess, invoice }) => (
            <Card key={payment.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <p style={{ fontWeight: 700 }}>{mess?.name ?? "Unknown Mess"}</p>
                  <p className="hint">{formatDate(payment.createdAt)}</p>
                  <StatusBadge status={payment.status} />
                </div>
                <div style={{ textAlign: "right", display: "grid", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, fontWeight: 700 }}><MoneyDisplay amount={payment.amount / 100} /></span>
                  <Link href={`/user/payments/${payment.id}`} className="button button-secondary" style={{ fontSize: 12, padding: "4px 12px" }}>
                    View
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {items.length === 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {page > 1 && <Link href={`?page=${page - 1}`} className="button button-secondary">Previous</Link>}
          <Link href={`?page=${page + 1}`} className="button button-secondary">Next</Link>
        </div>
      )}
    </div>
  );
}
