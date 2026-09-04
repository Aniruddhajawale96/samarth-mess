"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentsApi, subscriptionsApi } from "../../../../lib/api";
import { ApiError } from "../../../../lib/api/client";
import { Card, CardHeader, CardContent, Button } from "../../../../components/ui";
import { MoneyDisplay } from "../../../../components/domain";

// Razorpay type shim (loaded via script tag)
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open(): void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subscriptionId) {
      setError("No subscription ID provided.");
      setLoading(false);
      return;
    }

    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Initiate the payment to get the provider order
    paymentsApi.initiatePayment(subscriptionId)
      .then(res => {
        setSummary(res);
        setLoading(false);
      })
      .catch((err: ApiError) => {
        setError(err.message || "Failed to initiate payment.");
        setLoading(false);
      });

    return () => {
      document.body.removeChild(script);
    };
  }, [subscriptionId]);

  const handlePay = useCallback(() => {
    if (!summary || !window.Razorpay) {
      setError("Payment provider not ready. Please try again.");
      return;
    }

    setProcessing(true);
    setError("");

    const options = {
      key: summary.provider.keyId,
      // The server created a real Razorpay order for the DB rupee amount * 100 (paise).
      amount: summary.payment.amount * 100,
      currency: summary.payment.currency ?? "INR",
      name: "Samarth Mess",
      description: "Monthly Subscription",
      order_id: summary.provider.orderId,
      handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        try {
          await paymentsApi.verifyPayment(summary.payment.id, {
            providerPaymentId: response.razorpay_payment_id,
            providerOrderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
          router.push(`/user/payments/result?status=success&paymentId=${summary.payment.id}`);
        } catch (err: any) {
          router.push(`/user/payments/result?status=failure&paymentId=${summary.payment.id}`);
        }
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
      prefill: {},
      theme: { color: "#16a34a" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [summary, router]);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ height: 24, background: "var(--line)", borderRadius: 6, width: "60%" }} />
        <div style={{ height: 200, background: "var(--line)", borderRadius: 8 }} />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
        <div className="error-banner">{error}</div>
        <button className="button button-secondary" onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 480, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">PAYMENT</p>
        <h1>Payment Summary</h1>
      </div>

      {processing && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", zIndex: 100
        }}>
          <div className="panel" style={{ padding: 32, textAlign: "center", maxWidth: 300 }}>
            <p style={{ fontWeight: 700, fontSize: 18 }}>Processing Payment</p>
            <p className="muted" style={{ marginTop: 8 }}>Please do not close or refresh this page.</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><h2>Order Details</h2></CardHeader>
        <CardContent style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="hint">Payment Method</span>
            <span style={{ fontWeight: 600 }}>Razorpay</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="hint">Currency</span>
            <span style={{ fontWeight: 600 }}>{summary.payment.currency}</span>
          </div>
          <div style={{ background: "var(--line)", height: 1 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <MoneyDisplay amount={summary.payment.amount} className="font-bold" />
          </div>
        </CardContent>
      </Card>

      {error && <div className="error-banner">{error}</div>}

      <Button
        variant="primary"
        style={{ width: "100%", fontSize: 16, padding: "14px" }}
        onClick={handlePay}
        disabled={processing}
      >
        {processing ? "Processing…" : `Pay ₹${summary.payment.amount}`}
      </Button>

      <p className="hint" style={{ textAlign: "center", fontSize: 12 }}>
        You will be redirected to Razorpay to complete payment. Do not close the tab.
      </p>
    </div>
  );
}
