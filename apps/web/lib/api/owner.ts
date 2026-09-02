/** owner.ts — maps to /owner/* backend routes */
import { api } from "./client";
import type { AttendanceRecord } from "./attendance";
import type { SubscriptionRecord } from "./subscriptions";
import type { MessRecord } from "./messes";

export interface OwnerMessRecord {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  address: string | null;
  contact: string | null;
  monthlyPrice: number;
  mealsPerDay: number;
  skipCutoffMinutes: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerDashboard {
  mess: OwnerMessRecord;
  customers: { total: number; active: number; pendingApprovals: number };
  today: { date: string; expectedMeals: number; present: number; absent: number; extra: number };
  revenue: { successfulAmount: number; currency: string };
  primaryActions: string[];
}

export interface MessCreateInput {
  name: string;
  description?: string;
  address?: string;
  contact?: string;
  monthlyPrice: number;
  mealsPerDay: number;
}

export interface MessUpdateInput {
  name?: string;
  description?: string;
  address?: string;
  contact?: string;
  monthlyPrice?: number;
  mealsPerDay?: number;
  skipCutoffMinutes?: number;
}

export interface AttendanceBatchRecord {
  userId: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  status: "PRESENT" | "ABSENT" | "EXTRA";
}

export interface OwnerCustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "DISABLED";
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  userType: string | null;
  profilePhotoUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** GET /owner/dashboard — CONFIRMED */
export function getOwnerDashboard() {
  return api.get<OwnerDashboard>("/owner/dashboard");
}

/** GET /owner/mess — current owner's mess */
export function getOwnerMess() {
  return api.get<{ mess: OwnerMessRecord }>("/owner/mess");
}

/** POST /owner/messes */
export function createOwnerMess(input: MessCreateInput) {
  return api.post<{ mess: OwnerMessRecord }>("/owner/messes", input);
}

/** PATCH /owner/messes/:messId */
export function updateOwnerMess(messId: string, input: MessUpdateInput) {
  return api.patch<{ mess: OwnerMessRecord }>(`/owner/messes/${messId}`, input);
}

/** PATCH /owner/messes/:messId/status */
export function updateOwnerMessStatus(messId: string, status: "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL") {
  return api.patch<{ mess: OwnerMessRecord }>(`/owner/messes/${messId}/status`, { status });
}

/**
 * POST /owner/messes/:messId/cover-image
 * Multipart/form-data — field name: "cover"
 */
export function uploadMessCoverImage(messId: string, file: File) {
  const form = new FormData();
  form.append("cover", file);
  return api.postForm<{ mess: OwnerMessRecord }>(`/owner/messes/${messId}/cover-image`, form);
}

/** GET /owner/subscriptions/pending */
export function getPendingSubscriptions(query: { page?: number; limit?: number } = {}) {
  return api.get<{ items: Array<{ subscription: SubscriptionRecord; user: CustomerRecord; mess: MessRecord }>; page: number; limit: number }>(
    "/owner/subscriptions/pending",
    { page: query.page ?? 1, limit: query.limit ?? 20 },
  );
}

/** POST /owner/subscriptions/:subscriptionId/approve */
export function approveSubscription(subscriptionId: string) {
  return api.post<{ subscription: SubscriptionRecord }>(`/owner/subscriptions/${subscriptionId}/approve`);
}

/** POST /owner/subscriptions/:subscriptionId/reject */
export function rejectSubscription(subscriptionId: string) {
  return api.post<{ subscription: SubscriptionRecord }>(`/owner/subscriptions/${subscriptionId}/reject`);
}

/** GET /owner/attendance */
export function getOwnerAttendance(query: { messId?: string; date?: string } = {}) {
  return api.get<{
    mess: OwnerMessRecord;
    date: string;
    customers: Array<{
      subscription: SubscriptionRecord;
      user: { id: string; name: string; phone: string; email: string | null };
    }>;
    attendance: AttendanceRecord[];
  }>("/owner/attendance", { messId: query.messId, date: query.date });
}

/** POST /owner/attendance/manual */
export function markManualAttendance(input: {
  messId: string;
  date: string;
  records: AttendanceBatchRecord[];
}) {
  return api.post<{ date: string; items: AttendanceRecord[] }>("/owner/attendance/manual", input);
}

/** POST /owner/attendance/qr */
export function scanQrAttendance(input: {
  messId: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  token: string;
}) {
  return api.post<{
    user: { id: string; name: string };
    attendance: AttendanceRecord;
  }>("/owner/attendance/qr", input);
}

/** GET /owner/customers — paginated */
export function getOwnerCustomers(query: OwnerCustomerQuery = {}) {
  return api.get<{
    items: Array<{ user: CustomerRecord; subscription: SubscriptionRecord; mess: MessRecord }>;
    page: number;
    limit: number;
    total: number;
  }>("/owner/customers", {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    search: query.search,
    status: query.status,
  });
}

/** GET /owner/customers/:userId */
export function getOwnerCustomer(userId: string) {
  return api.get<{
    user: CustomerRecord;
    subscriptions: Array<{ subscription: SubscriptionRecord; mess: MessRecord }>;
  }>(`/owner/customers/${userId}`);
}

/** PATCH /owner/customers/:userId/status */
export function updateOwnerCustomerStatus(userId: string, status: "ACTIVE" | "DISABLED") {
  return api.patch<{ user: CustomerRecord }>(`/owner/customers/${userId}/status`, { status });
}

/** GET /owner/payments */
export function getOwnerPayments(query: { page?: number; limit?: number } = {}) {
  return api.get<{
    items: Array<{
      date: string;
      user: { id: string; name: string };
      amount: number;
      status: string;
      subscriptionReference: string | null;
      providerReference: string | null;
    }>;
    page: number;
    limit: number;
    totals: { todayCollected: number; monthCollected: number; pending: number };
  }>("/owner/payments", { page: query.page ?? 1, limit: query.limit ?? 20 });
}
