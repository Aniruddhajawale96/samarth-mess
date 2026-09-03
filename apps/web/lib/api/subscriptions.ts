/** subscriptions.ts — maps to /messes/:messId/subscriptions and /subscriptions/me */
import { api } from "./client";
import type { MessRecord } from "./messes";

export interface SubscriptionRecord {
  id: string;
  userId: string;
  messId: string;
  status: "PENDING_PAYMENT" | "PENDING_APPROVAL" | "ACTIVE" | "CANCELLED" | "EXPIRED";
  autoRenew: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
}

/**
 * POST /messes/:messId/subscriptions
 * Creates a subscription + payment intent for the given mess.
 */
export function requestSubscription(messId: string, autoRenew: boolean) {
  return api.post<{ subscription: SubscriptionRecord; paymentIntent: PaymentIntent }>(
    `/messes/${messId}/subscriptions`,
    { autoRenew },
  );
}

/** GET /subscriptions/me — all subscriptions for the current user */
export function getMySubscriptions() {
  return api.get<{ items: Array<{ subscription: SubscriptionRecord; mess: MessRecord }> }>(
    "/subscriptions/me",
  );
}
