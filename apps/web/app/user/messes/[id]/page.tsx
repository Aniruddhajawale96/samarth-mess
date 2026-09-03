import * as React from "react";
import Link from "next/link";
import { messesApi, subscriptionsApi } from "../../../../lib/api";
import { Tabs, Button } from "../../../../components/ui";
import { MenuRow } from "../../../../components/domain";
import { fetchSession } from "../../../../lib/auth";
import { MessTabs } from "./MessTabs";

export const dynamic = 'force-dynamic';

export default async function UserMessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  let data;
  let subs: any[] = [];
  try {
    const today = new Date().toISOString().slice(0, 10);
    const res = await messesApi.getMess(id, today);
    data = res;

    // Check user's subscription to see if we should show "Subscribe Now" or something else
    const session = await fetchSession();
    if (session.isLoggedIn) {
      const subRes = await subscriptionsApi.getMySubscriptions();
      subs = subRes.items;
    }
  } catch (err) {
    console.error("Failed to fetch mess detail", err);
    return <div>Failed to load mess details.</div>;
  }

  if (!data || !data.mess) {
    return <div>Mess not found.</div>;
  }

  const { mess, menuPreview } = data;
  
  // Find if user already has a subscription for this mess
  const currentSub = subs.find(s => s.mess.id === id);
  let ctaText = "Subscribe Now";
  let ctaHref = `/user/messes/${id}/subscribe`;
  let ctaDisabled = false;

  if (currentSub) {
    const status = currentSub.subscription.status;
    if (status === "ACTIVE") {
      ctaText = "Subscribed (Active)";
      ctaHref = "#";
      ctaDisabled = true;
    } else if (status === "PENDING_APPROVAL") {
      ctaText = "Waiting for Approval";
      ctaHref = "#";
      ctaDisabled = true;
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: "var(--line)", height: 200, borderRadius: 12, overflow: "hidden" }}>
        {mess.coverImage ? (
          <img src={mess.coverImage} alt={mess.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)" }}>Cover Image</div>
        )}
      </div>

      <div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>{mess.name}</h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 14 }}>
          <span style={{ background: "var(--green-soft)", color: "var(--green)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
            4.5 ★
          </span>
          <span className="hint">{mess.address || "Location not provided"}</span>
          <span className="hint">{mess.contact || "No contact"}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, padding: "16px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div>
          <p className="hint">Monthly Plan</p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>₹{mess.monthlyPrice}</p>
        </div>
        <div>
          <p className="hint">Meals Per Day</p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>{mess.mealsPerDay} meals</p>
        </div>
      </div>

      <MessTabs
        overview={
          <div style={{ paddingTop: 16 }}>
            <p style={{ lineHeight: 1.6 }}>{mess.description || "No description provided."}</p>
          </div>
        }
        menu={
          <div style={{ paddingTop: 16, display: "grid", gap: 12 }}>
            {menuPreview && menuPreview.length > 0 ? (
              menuPreview.map((item: any, idx: number) => (
                <MenuRow key={idx} mealType={item.mealType} itemName={item.itemName} description={item.description} />
              ))
            ) : (
              <p className="hint">No menu published for today.</p>
            )}
          </div>
        }
        reviews={
          <div style={{ paddingTop: 16 }}>
            <p className="hint">No reviews yet.</p>
          </div>
        }
      />

      {/* Sticky CTA */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px 24px",
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{ maxWidth: 800, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>₹{mess.monthlyPrice} <span className="hint" style={{ fontSize: 14 }}>/ month</span></p>
          </div>
          {ctaDisabled ? (
            <Button disabled>{ctaText}</Button>
          ) : (
            <Link href={ctaHref} className="button button-primary">
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
