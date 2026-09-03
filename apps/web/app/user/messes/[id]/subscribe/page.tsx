"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { messesApi, subscriptionsApi } from "../../../../../lib/api";
import { Card, CardHeader, CardContent, Button } from "../../../../../components/ui";

export default function SubscribePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [mess, setMess] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    messesApi.getMess(id)
      .then(res => {
        setMess(res.mess);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load mess details.");
        setLoading(false);
      });
  }, [id]);

  const handleSubscribe = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await subscriptionsApi.requestSubscription(id, true);
      router.push(`/user/payments/checkout?subscriptionId=${res.subscription.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create subscription");
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error && !mess) return <div style={{ padding: 24, color: "var(--red)" }}>{error}</div>;

  const today = new Date();
  const startDate = today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">SUBSCRIBE</p>
        <h1>{mess.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <h2>Monthly Plan</h2>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: 24, fontWeight: 800 }}>₹{mess.monthlyPrice}</p>
              <p className="hint">per month</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 600 }}>{mess.mealsPerDay} Meals / Day</p>
            </div>
          </div>

          <div style={{ background: "var(--line)", height: 1, margin: "8px 0" }} />

          <div>
            <p className="hint">Subscription period starts</p>
            <p style={{ fontWeight: 600 }}>{startDate}</p>
          </div>

          <div style={{ background: "var(--yellow)22", padding: 12, borderRadius: 8 }}>
            <p style={{ color: "var(--yellow)", fontWeight: 600, fontSize: 14 }}>Please Note</p>
            <p style={{ color: "var(--yellow)", fontSize: 13, marginTop: 4 }}>
              Payment does not mean immediate activation. Your subscription will require owner approval after payment.
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <Button
            variant="primary"
            style={{ width: "100%", marginTop: 8 }}
            onClick={handleSubscribe}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Continue to Payment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
