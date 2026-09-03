import * as React from "react";
import Link from "next/link";
import { messesApi } from "../../../lib/api";
import { EmptyState, Card } from "../../../components/ui";

export const dynamic = 'force-dynamic';

export default async function UserMessesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  let messes: any[] = [];
  try {
    const res = await messesApi.getMesses({
      search,
      page: pageParam ? parseInt(pageParam) : 1,
      limit: 50,
    });
    messes = res.items;
  } catch (err) {
    console.error("Failed to fetch messes", err);
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">DISCOVERY</p>
        <h1>Find a Mess</h1>
      </div>

      <form style={{ display: "flex", gap: 12 }}>
        <input
          name="search"
          type="search"
          placeholder="Search messes..."
          className="input"
          defaultValue={search}
          style={{ flex: 1 }}
        />
        <button className="button button-primary" type="submit">Search</button>
      </form>

      {messes.length === 0 ? (
        <EmptyState>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3>No messes found.</h3>
            <p className="muted">Try changing your search or filters.</p>
          </div>
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {messes.map((mess) => (
            <Card key={mess.id} style={{ display: "flex", overflow: "hidden", flexDirection: "column" }}>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <div style={{ flex: "0 0 120px", background: "var(--line)", minHeight: 120 }}>
                  {mess.coverImage ? (
                    <img src={mess.coverImage} alt={mess.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)" }}>Image</div>
                  )}
                </div>
                <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3 style={{ fontSize: 18, margin: 0 }}>{mess.name}</h3>
                    <span style={{ background: "var(--green-soft)", color: "var(--green)", padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                      4.5 ★
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 14 }}>
                    <span className="hint">₹{mess.monthlyPrice}/month</span>
                    <span className="hint">{mess.mealsPerDay} meals/day</span>
                    <span className="hint">500m away</span>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", justifyContent: "flex-end" }}>
                    <Link href={`/user/messes/${mess.id}`} className="button button-secondary button-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
