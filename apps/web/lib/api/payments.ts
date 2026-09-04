/** payments.ts — maps to /payments/* backend routes */
import { api } from "./client";
import type { MessRecord } from "./messes";

export interface PaymentRecord {
  id: string;
  userId: string;
  messId: string;
  subscriptionId: string | null;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  /** Absolute or relative URL of the generated invoice PDF (backend column file_url). */
  fileUrl: string | null;
  createdAt: string;
}

export interface PaymentsQuery {
  page?: number;
  limit?: number;
  status?: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
}

export interface VerifyPaymentInput {
  providerPaymentId: string;
  providerOrderId: string;
  signature: string;
}

/**
 * POST /payments — initiate payment for a subscription.
 * Body: { subscriptionId }
 */
export function initiatePayment(subscriptionId: string) {
  return api.post<{
    payment: Pick<PaymentRecord, "id" | "status" | "amount" | "currency" | "provider" | "providerOrderId">;
    provider: { keyId: string | null; orderId: string | null };
  }>("/payments", { subscriptionId });
}

/** GET /payments — paginated list of the current user's payments */
export function getPayments(query: PaymentsQuery = {}) {
  return api.get<{
    items: Array<{ payment: PaymentRecord; mess: MessRecord; invoice: InvoiceRecord | null }>;
    page: number;
    limit: number;
  }>("/payments", {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    status: query.status,
  });
}

/** GET /payments/:paymentId */
export function getPayment(paymentId: string) {
  return api.get<{ payment: PaymentRecord; mess: MessRecord; invoice: InvoiceRecord | null }>(
    `/payments/${paymentId}`,
  );
}

/** GET /payments/:paymentId/invoice — CONFIRMED route */
export function getInvoice(paymentId: string) {
  return api.get<{ invoice: InvoiceRecord }>(`/payments/${paymentId}/invoice`);
}

/** POST /payments/:paymentId/verify — CONFIRMED route */
export function verifyPayment(paymentId: string, input: VerifyPaymentInput) {
  return api.post<{ payment: PaymentRecord; subscriptionStatus: string }>(
    `/payments/${paymentId}/verify`,
    input,
  );
}
