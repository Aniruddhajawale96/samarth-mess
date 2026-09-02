"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "../../../lib/api";
import { type AdminUserRecord } from "../../../lib/api/admin";
import { Card, CardContent, EmptyState } from "../../../components/ui";
import { StatusBadge, UserAvatar } from "../../../components/domain";
import Link from "next/link";

export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string; status?: string }>;
}) {
  const router = useRouter();
  const params = use(searchParams);
  const page = parseInt(params.page ?? "1");
  const role = (params.role === "OWNER" ? "OWNER" : "USER") as "USER" | "OWNER";
  const status = (params.status as "ACTIVE" | "DISABLED") || undefined;
  const search = params.search || "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(search);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getAdminUsers({ page, limit: 25, search: search || undefined, role, status })
      .then(res => { setData(res); setError(""); setLoading(false); })
      .catch((err: any) => { setError(err.message || "Failed to load users"); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, [page, role, status, search]);

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "enable" : "disable";
    if (newStatus === "DISABLED" && !window.confirm(`Are you sure you want to disable this account? This action takes effect immediately.`)) return;
    setProcessing(userId);
    try {
      const res = await adminApi.updateAdminUserStatus(userId, newStatus);
      setData((prev: any) => ({
        ...prev,
        items: prev.items.map((item: any) =>
          item.user.id === userId ? { ...item, user: { ...item.user, status: res.user.status } } : item
        ),
      }));
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setProcessing(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (searchInput) q.set("search", searchInput);
    q.set("role", role);
    if (status) q.set("status", status);
    router.push(`/admin/users?${q.toString()}`);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="eyebrow">PLATFORM</p>
        <h1>Users</h1>
      </div>

      {/* Role tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--line)" }}>
        {(["USER", "OWNER"] as const).map(r => (
          <Link
            key={r}
            href={`/admin/users?role=${r}`}
            style={{
              padding: "8px 20px",
              fontWeight: 700,
              fontSize: 14,
              borderBottom: role === r ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -2,
              color: role === r ? "var(--primary)" : "var(--muted)",
              textDecoration: "none",
            }}
          >
            {r === "USER" ? "Users" : "Owners"}
          </Link>
        ))}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          type="search"
          className="input"
          placeholder="Search name, phone, or email..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        <select
          className="input"
          style={{ width: 140 }}
          value={status || ""}
          onChange={e => {
            const s = e.target.value;
            const q = new URLSearchParams();
            if (search) q.set("search", search);
            q.set("role", role);
            if (s) q.set("status", s);
            router.push(`/admin/users?${q.toString()}`);
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
        <button type="submit" className="button button-primary">Search</button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {loading && !data ? (
        <EmptyState>Loading accounts...</EmptyState>
      ) : data?.items.length === 0 ? (
        <EmptyState>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontWeight: 600 }}>No accounts found</p>
            <p className="hint">Try adjusting your filters.</p>
          </div>
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {data?.items.map(({ user, mess }: any) => (
            <Card key={user.id}>
              <CardContent style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <UserAvatar name={user.name} />
                  <div>
                    <p style={{ fontWeight: 700 }}>{user.name}</p>
                    <p className="hint" style={{ fontSize: 13 }}>
                      {user.phone}
                      {user.email ? ` • ${user.email}` : ""}
                      {user.userType ? ` • ${user.userType}` : ""}
                    </p>
                    {mess && (
                      <p style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, marginTop: 2 }}>
                        Mess: {mess.name} ({mess.status})
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <StatusBadge status={user.status} />
                  <p className="hint" style={{ fontSize: 12 }}>
                    {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <button
                    className="button button-secondary"
                    style={{
                      fontSize: 13,
                      padding: "6px 12px",
                      color: user.status === "ACTIVE" ? "var(--red)" : "var(--green)",
                      borderColor: user.status === "ACTIVE" ? "var(--red)" : "var(--green)",
                    }}
                    disabled={processing === user.id}
                    onClick={() => handleStatusChange(user.id, user.status)}
                  >
                    {processing === user.id ? "…" : user.status === "ACTIVE" ? "Disable" : "Enable"}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.items.length === data.limit && (
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          {page > 1 && (
            <Link href={`/admin/users?role=${role}&page=${page - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`} className="button button-secondary">
              Previous
            </Link>
          )}
          <Link href={`/admin/users?role=${role}&page=${page + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`} className="button button-secondary">
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
