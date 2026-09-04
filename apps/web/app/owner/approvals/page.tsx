"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, use } from "react";
import { ownerApi } from "../../../lib/api";
import { EmptyState, Card, CardContent, Button } from "../../../components/ui";
import { MoneyDisplay, UserAvatar, StatusBadge } from "../../../components/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApprovalsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const router = useRouter();
  const { page: pageParam } = use(searchParams);
  const page = parseInt(pageParam ?? "1");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getPendingSubscriptions({ page, limit: 20 });
      setData(res);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [page]);

  const handleApprove = async (subId: string) => {
    setProcessing(subId);
    try {
      await ownerApi.approveSubscription(subId);
      await fetchApprovals();
    } catch (err: any) {
      alert(err.message || "Failed to approve");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (subId: string) => {
    if (!window.confirm("Are you sure you want to REJECT this subscription? The user will be notified.")) return;
    setProcessing(subId);
    try {
      await ownerApi.rejectSubscription(subId);
      await fetchApprovals();
    } catch (err: any) {
      alert(err.message || "Failed to reject");
    } finally {
      setProcessing(null);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
        <h1>Approvals</h1>
        <EmptyState>Loading pending approvals...</EmptyState>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
        <h1>Approvals</h1>
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">CUSTOMERS</p>
        <h1>Pending Approvals</h1>
      </div>

      {items.length === 0 ? (
        <EmptyState>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p style={{ fontWeight: 600 }}>All caught up!</p>
            <p className="hint">There are no pending subscriptions to review.</p>
          </div>
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map(({ subscription, user, mess }: any) => (
            <Card key={subscription.id}>
              <CardContent style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <UserAvatar name={user.name} profilePhotoUrl={user.profilePhotoUrl} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 700 }}>{user.name}</p>
                  <p className="hint" style={{ fontSize: 13, textTransform: "capitalize" }}>{user.userType?.toLowerCase() || "User"} • {user.phone}</p>
                  <div style={{ display: "grid", gap: 4, marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span className="hint">Plan:</span>
                      <span style={{ fontWeight: 600 }}>{mess?.name ?? "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span className="hint">Amount:</span>
                      <span style={{ fontWeight: 600 }}><MoneyDisplay amount={mess?.monthlyPrice ?? 0} /></span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span className="hint">Requested:</span>
                      <span style={{ fontWeight: 600 }}>{new Date(subscription.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 140 }}>
                  <Button
                    variant="primary"
                    disabled={processing === subscription.id}
                    onClick={() => handleApprove(subscription.id)}
                  >
                    {processing === subscription.id ? "..." : "Approve"}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={processing === subscription.id}
                    onClick={() => handleReject(subscription.id)}
                    style={{ color: "var(--red)", borderColor: "var(--red)" }}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Basic Pagination logic */}
      {data && data.total > data.limit && (
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
          {page > 1 && (
            <Link href={`/owner/approvals?page=${page - 1}`} className="button button-secondary">Previous</Link>
          )}
          {items.length === data.limit && (
            <Link href={`/owner/approvals?page=${page + 1}`} className="button button-secondary">Next</Link>
          )}
        </div>
      )}
    </div>
  );
}
