"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, use } from "react";
import { ownerApi } from "../../../lib/api";
import { EmptyState, Card, CardContent } from "../../../components/ui";
import { UserAvatar, StatusBadge } from "../../../components/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerCustomersPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string }> }) {
  const router = useRouter();
  const params = use(searchParams);
  
  const page = parseInt(params.page ?? "1");
  const search = params.search || "";
  const statusFilter = (params.status as "ACTIVE" | "DISABLED") || undefined;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState<string>(search);
  const [statusInput, setStatusInput] = useState<string>(statusFilter || "");

  useEffect(() => {
    setLoading(true);
    ownerApi.getOwnerCustomers({ page, limit: 30, search: search || undefined, status: statusFilter })
      .then(res => {
        setData(res);
        setError("");
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load customers.");
        setLoading(false);
      });
  }, [page, search, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchInput) query.set("search", searchInput);
    if (statusInput && (statusInput === "ACTIVE" || statusInput === "DISABLED")) {
      query.set("status", statusInput);
    }
    router.push(`/owner/customers?${query.toString()}`);
  };

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 800, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">DIRECTORY</p>
        <h1>Customers</h1>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          type="search"
          className="input"
          placeholder="Search by name or phone..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="input"
          value={statusInput}
          onChange={e => setStatusInput(e.target.value)}
          style={{ width: 140 }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
        <button type="submit" className="button button-primary">Search</button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {loading && !data ? (
        <EmptyState>Loading customers...</EmptyState>
      ) : data?.items.length === 0 ? (
        <EmptyState>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p style={{ fontWeight: 600 }}>No customers found</p>
            <p className="hint">Try adjusting your search or filters.</p>
          </div>
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data?.items.map(({ user, subscription, mess }: any) => (
            <Link key={user.id} href={`/owner/customers/${user.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Card style={{ cursor: "pointer", transition: "border-color 0.2s ease" }}>
                <CardContent style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <UserAvatar name={user.name} profilePhotoUrl={user.profilePhotoUrl} />
                    <div>
                      <p style={{ fontWeight: 700 }}>{user.name}</p>
                      <p className="hint" style={{ fontSize: 13 }}>{user.phone} • {mess?.name ?? "—"}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <StatusBadge status={user.status} />
                    {subscription.status !== "ACTIVE" && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--yellow)", background: "var(--yellow)22", padding: "2px 6px", borderRadius: 12 }}>
                        Sub: {subscription.status}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {data && data.total > data.limit && (
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
          {page > 1 && (
            <Link href={`/owner/customers?page=${page - 1}&search=${search}&status=${statusFilter || ""}`} className="button button-secondary">
              Previous
            </Link>
          )}
          {data.items.length === data.limit && (
            <Link href={`/owner/customers?page=${page + 1}&search=${search}&status=${statusFilter || ""}`} className="button button-secondary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
