"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const paymentId = searchParams.get("paymentId");

  const isSuccess = status === "success";

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 40 }}>
      {isSuccess ? (
        <>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "var(--green-soft)", display: "grid",
            placeItems: "center", margin: "0 auto"
          }}>
            <span style={{ fontSize: 36, color: "var(--green)" }}>✓</span>
          </div>

          <div>
            <h1>Payment Successful</h1>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              Your invoice has been generated. Your subscription is now
              <strong> waiting for mess owner approval.</strong>
            </p>
          </div>

          <div className="panel" style={{ padding: 16, textAlign: "left", display: "grid", gap: 8 }}>
            <p style={{ fontWeight: 700 }}>What happens next?</p>
            <p className="hint">1. The mess owner will review your payment.</p>
            <p className="hint">2. Once approved, your subscription becomes ACTIVE.</p>
            <p className="hint">3. You will be able to book meals after activation.</p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <Link href="/user" className="button button-primary button-wide">
              Back to Home
            </Link>
            {paymentId && (
              <Link href={`/user/payments/${paymentId}`} className="button button-secondary button-wide">
                View Payment
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#fbe5e3", display: "grid",
            placeItems: "center", margin: "0 auto"
          }}>
            <span style={{ fontSize: 36, color: "var(--red)" }}>✗</span>
          </div>

          <div>
            <h1>Payment Failed</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Your payment could not be processed. Please try again.
            </p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <button onClick={() => window.history.back()} className="button button-primary button-wide">
              Try Again
            </button>
            <Link href="/user" className="button button-secondary button-wide">
              Back to Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
