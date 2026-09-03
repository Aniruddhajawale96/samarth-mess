"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, use } from "react";
import { ownerApi } from "../../../../lib/api";
import { Card, CardHeader, CardContent, Button } from "../../../../components/ui";
import { UserAvatar, StatusBadge, MoneyDisplay } from "../../../../components/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    ownerApi.getOwnerCustomer(id)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load customer details");
        setLoading(false);
      });
  }, [id]);

  const toggleStatus = async () => {
    if (!data) return;
    const newStatus = data.user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "enable" : "disable";
    if (newStatus === "DISABLED" && !window.confirm(`Are you sure you want to disable this customer?`)) return;

    setProcessing(true);
    try {
      await ownerApi.updateOwnerCustomerStatus(id, newStatus);
      setData((prev: any) => ({ ...prev, user: { ...prev.user, status: newStatus } }));
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ padding: 24, textAlign: "center" }}>Loading customer...</div>;

  if (error || !data) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <div className="error-banner">{error || "Customer not found"}</div>
        <Link href="/owner/customers" className="button button-secondary" style={{ marginTop: 16 }}>Back to Customers</Link>
      </div>
    );
  }

  const { user, subscriptions } = data;
  const currentSub = subscriptions[0]?.subscription; // Usually the most recent or active one

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <Link href="/owner/customers" className="hint" style={{ fontSize: 13 }}>← Customers</Link>
        <h1 style={{ marginTop: 8 }}>Customer Profile</h1>
      </div>

      <Card>
        <CardContent style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <UserAvatar name={user.name} profilePhotoUrl={user.profilePhotoUrl} size="lg" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 20 }}>{user.name}</p>
                <p className="hint" style={{ textTransform: "capitalize" }}>{user.userType?.toLowerCase() || "User"}</p>
              </div>
              <StatusBadge status={user.status} />
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="hint" style={{ width: 60 }}>Phone</span>
                <span style={{ fontWeight: 600 }}>{user.phone}</span>
              </div>
              {user.email && (
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="hint" style={{ width: 60 }}>Email</span>
                  <span style={{ fontWeight: 600 }}>{user.email}</span>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <span className="hint" style={{ width: 60 }}>Joined</span>
                <span style={{ fontWeight: 600 }}>{new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Current Subscription</h2>
            {currentSub && <StatusBadge status={currentSub.status} />}
          </div>
        </CardHeader>
        <CardContent>
          {currentSub ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="hint">Plan Type</span>
                <span style={{ fontWeight: 600 }}>{currentSub.planType}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="hint">Amount Paid</span>
                <span style={{ fontWeight: 600 }}><MoneyDisplay amount={currentSub.amount / 100} /></span>
              </div>
              {currentSub.startDate && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="hint">Valid From</span>
                  <span style={{ fontWeight: 600 }}>{new Date(currentSub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              )}
              {currentSub.endDate && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="hint">Valid Until</span>
                  <span style={{ fontWeight: 600 }}>{new Date(currentSub.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="hint">No active subscriptions found for this mess.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 style={{ color: "var(--red)" }}>Account Management</h2>
        </CardHeader>
        <CardContent>
          <p className="hint" style={{ marginBottom: 16 }}>
            Disabling a customer prevents them from accessing your mess. They will not be able to book meals or view the menu.
          </p>
          <Button
            variant="secondary"
            onClick={toggleStatus}
            disabled={processing}
            style={{ color: user.status === "ACTIVE" ? "var(--red)" : "var(--green)", borderColor: user.status === "ACTIVE" ? "var(--red)" : "var(--green)", width: "100%" }}
          >
            {processing ? "Updating..." : user.status === "ACTIVE" ? "Disable Customer" : "Enable Customer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
