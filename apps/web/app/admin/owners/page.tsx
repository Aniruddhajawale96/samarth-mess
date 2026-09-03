"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect } from "react";
import { adminApi } from "../../../lib/api";
import { Card, CardContent, EmptyState, Button } from "../../../components/ui";
import { StatusBadge, UserAvatar, MoneyDisplay } from "../../../components/domain";

export default function AdminOwnersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchMesses = () => {
    setLoading(true);
    adminApi.getAdminMesses()
      .then(res => { setData(res); setError(""); setLoading(false); })
      .catch((err: any) => { setError(err.message || "Failed to load owners"); setLoading(false); });
  };

  useEffect(() => { fetchMesses(); }, []);

  const handleStatusChange = async (messId: string, currentStatus: string, newStatus: "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL") => {
    // TODO: No real owner-approval route exists (e.g. POST /admin/owners/:ownerId/approve).
    // Currently, we approve the Mess itself. A dedicated endpoint for approving the Owner 
    // account status may be needed.
    let action = newStatus === "ACTIVE" ? "approve/enable" : newStatus === "INACTIVE" ? "disable/reject" : "mark pending";
    if (currentStatus === "PENDING_APPROVAL") {
      action = newStatus === "ACTIVE" ? "approve" : "reject";
    }
    
    if ((newStatus === "INACTIVE" || action === "reject") && !window.confirm(`Are you sure you want to ${action} this mess?`)) return;
    
    setProcessing(messId);
    try {
      const res = await adminApi.updateAdminMessStatus(messId, newStatus);
      setData((prev: any) => ({
        ...prev,
        items: prev.items.map((item: any) =>
          item.mess.id === messId ? { ...item, mess: { ...item.mess, status: res.mess.status } } : item
        ),
      }));
    } catch (err: any) {
      alert(err.message || "Failed to update mess status");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="eyebrow">PLATFORM</p>
        <h1>Owners & Messes</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && !data ? (
        <EmptyState>Loading owners and messes...</EmptyState>
      ) : data?.items.length === 0 ? (
        <EmptyState>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontWeight: 600 }}>No owners found</p>
            <p className="hint">When owners register a mess, they will appear here.</p>
          </div>
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {data?.items.map(({ mess, owner }: any) => {
            const isPending = mess.status === "PENDING_APPROVAL";
            
            return (
              <Card key={mess.id} style={{ borderColor: isPending ? "var(--yellow)" : undefined }}>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  {/* Top Header: Owner Info & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <UserAvatar name={owner.name} profilePhotoUrl={owner.profilePhotoUrl} size="lg" />
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 18 }}>{owner.name}</p>
                        <p className="hint" style={{ fontSize: 13 }}>
                          {owner.phone} {owner.email ? `• ${owner.email}` : ""}
                        </p>
                        <div style={{ marginTop: 4 }}>
                          <span style={{ fontSize: 11, background: "var(--line)", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>Owner Account: {owner.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <StatusBadge status={mess.status} />
                      <p className="hint" style={{ fontSize: 12 }}>
                        Registered: {new Date(mess.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Mess Info */}
                  <div style={{ background: "var(--card)", padding: 16, borderRadius: 8, border: "1px solid var(--line)", display: "grid", gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16 }}>Mess: {mess.name}</h3>
                      {mess.description && <p className="hint" style={{ fontSize: 13, marginTop: 4 }}>{mess.description}</p>}
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                      <div>
                        <p className="hint" style={{ fontSize: 12 }}>Monthly Price</p>
                        <p style={{ fontWeight: 600 }}><MoneyDisplay amount={mess.monthlyPrice / 100} /></p>
                      </div>
                      <div>
                        <p className="hint" style={{ fontSize: 12 }}>Meals per Day</p>
                        <p style={{ fontWeight: 600 }}>{mess.mealsPerDay}</p>
                      </div>
                      <div>
                        <p className="hint" style={{ fontSize: 12 }}>Contact</p>
                        <p style={{ fontWeight: 600 }}>{mess.contact || "N/A"}</p>
                      </div>
                    </div>
                    
                    {mess.address && (
                      <div>
                        <p className="hint" style={{ fontSize: 12 }}>Address</p>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{mess.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
                    {isPending ? (
                      <>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleStatusChange(mess.id, mess.status, "INACTIVE")}
                          disabled={processing === mess.id}
                          style={{ color: "var(--red)", borderColor: "var(--red)" }}
                        >
                          {processing === mess.id ? "Processing..." : "Reject Mess"}
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => handleStatusChange(mess.id, mess.status, "ACTIVE")}
                          disabled={processing === mess.id}
                        >
                          {processing === mess.id ? "Processing..." : "Approve Mess"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => handleStatusChange(mess.id, mess.status, mess.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                        disabled={processing === mess.id}
                        style={{ 
                          color: mess.status === "ACTIVE" ? "var(--red)" : "var(--green)", 
                          borderColor: mess.status === "ACTIVE" ? "var(--red)" : "var(--green)" 
                        }}
                      >
                        {processing === mess.id ? "Processing..." : mess.status === "ACTIVE" ? "Disable Mess" : "Enable Mess"}
                      </Button>
                    )}
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
