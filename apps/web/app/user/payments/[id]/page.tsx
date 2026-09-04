import * as React from "react";
import Link from "next/link";
import { paymentsApi } from "../../../../lib/api";
import { StatusBadge, MoneyDisplay } from "../../../../components/domain";
import { Card, CardHeader, CardContent } from "../../../../components/ui";
import { fetchSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await fetchSession();
  if (!session.isLoggedIn) redirect("/login");

  const { id } = await params;

  let data: any;
  try {
    data = await paymentsApi.getPayment(id);
  } catch (err: any) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <div className="error-banner">Payment not found or access denied.</div>
        <Link href="/user/payments" className="button button-secondary" style={{ marginTop: 16 }}>Back to Payments</Link>
      </div>
    );
  }

  const { payment, mess, invoice } = data;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <Link href="/user/payments" className="hint" style={{ fontSize: 13 }}>← Payments</Link>
        <h1 style={{ marginTop: 8 }}>Payment Detail</h1>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2>{mess?.name ?? "Unknown Mess"}</h2>
              <p className="hint">{formatDate(payment.createdAt)}</p>
            </div>
            <StatusBadge status={payment.status} />
          </div>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="hint">Amount</span>
            <span style={{ fontWeight: 700, fontSize: 18 }}><MoneyDisplay amount={payment.amount} /></span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="hint">Currency</span>
            <span style={{ fontWeight: 600 }}>{payment.currency}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="hint">Provider</span>
            <span style={{ fontWeight: 600 }}>{payment.provider}</span>
          </div>
          {payment.providerPaymentId && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="hint">Reference</span>
              <code style={{ fontSize: 12 }}>{payment.providerPaymentId}</code>
            </div>
          )}
          {payment.paidAt && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="hint">Paid At</span>
              <span style={{ fontWeight: 600 }}>{formatDate(payment.paidAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {invoice && (
        <Card>
          <CardContent style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700 }}>Invoice</p>
              <p className="hint">#{invoice.invoiceNumber}</p>
            </div>
            {invoice.fileUrl ? (
              <a href={invoice.fileUrl} target="_blank" rel="noopener noreferrer" className="button button-secondary">
                View Invoice
              </a>
            ) : (
              <span className="hint">PDF generating…</span>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
