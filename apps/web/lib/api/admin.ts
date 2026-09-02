/** admin.ts — maps to /admin/* backend routes */
import { api } from "./client";
import type { OwnerMessRecord } from "./owner";

export interface AdminUserRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: "USER" | "OWNER";
  userType: string | null;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
}

export interface AdminDashboard {
  users: number;
  owners: number;
  messes: number;
  pendingMesses: number;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: "USER" | "OWNER";
  status?: "ACTIVE" | "DISABLED";
}

export interface AuditEvent {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** GET /admin/dashboard */
export function getAdminDashboard() {
  return api.get<AdminDashboard>("/admin/dashboard");
}

/** GET /admin/users — paginated */
export function getAdminUsers(query: AdminUsersQuery = {}) {
  return api.get<{
    items: Array<{ user: AdminUserRecord; mess: OwnerMessRecord | null }>;
    page: number;
    limit: number;
  }>("/admin/users", {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    search: query.search,
    role: query.role ?? "USER",
    status: query.status,
  });
}

/** GET /admin/messes — returns up to 100 messes with owner info */
export function getAdminMesses() {
  return api.get<{
    items: Array<{ mess: OwnerMessRecord; owner: AdminUserRecord }>;
  }>("/admin/messes");
}

/** PATCH /admin/users/:userId/status */
export function updateAdminUserStatus(userId: string, status: "ACTIVE" | "DISABLED") {
  return api.patch<{ user: Pick<AdminUserRecord, "id" | "name" | "role" | "status"> }>(
    `/admin/users/${userId}/status`,
    { status },
  );
}

/** PATCH /admin/messes/:messId/status */
export function updateAdminMessStatus(messId: string, status: "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL") {
  return api.patch<{ mess: OwnerMessRecord }>(`/admin/messes/${messId}/status`, { status });
}

/**
 * GET /admin/audit — ADJUSTED (PRD called it /admin/audit-events; actual route is /admin/audit)
 * Optional query param: limit (1–100, default 50)
 */
export function getAuditLogs(limit?: number) {
  return api.get<{ items: AuditEvent[]; limit: number }>("/admin/audit", {
    limit: limit ?? 50,
  });
}
