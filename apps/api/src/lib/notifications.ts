import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, notificationAttempts } from "@samarth-mess/db";
import { logger } from "./logger.js";

export type NotificationEvent = "PAYMENT_SUCCESSFUL" | "SUBSCRIPTION_APPROVED" | "SUBSCRIPTION_REJECTED" | "INVOICE_AVAILABLE" | "NEW_SUBSCRIPTION_REQUEST";

type NotificationInput = {
  event: NotificationEvent;
  recipientUserId?: string;
  recipient?: string;
  payload: Record<string, unknown>;
  channel?: "IN_APP" | "EMAIL" | "WHATSAPP";
};

/** Provider-agnostic dispatcher: persist every attempt, then let providers be added independently. */
export async function notify(input: NotificationInput): Promise<void> {
  const channel = input.channel ?? "IN_APP";
  const id = randomUUID();
  try {
    await db.insert(notificationAttempts).values({ id, event: input.event, channel, recipientUserId: input.recipientUserId, recipient: input.recipient, status: "PENDING", payload: input.payload });
    // The in-app provider is the first safe provider; delivery is represented by the durable attempt.
    await db.update(notificationAttempts).set({ status: "SENT", updatedAt: new Date() }).where(eq(notificationAttempts.id, id));
    logger.info("notification_sent", { notificationId: id, event: input.event, channel, recipientUserId: input.recipientUserId });
  } catch (error) {
    logger.error("notification_failed", { notificationId: id, event: input.event, channel, recipientUserId: input.recipientUserId, error: error instanceof Error ? error.message : String(error) });
    try { await db.update(notificationAttempts).set({ status: "FAILED", error: error instanceof Error ? error.message : String(error), updatedAt: new Date() }).where(eq(notificationAttempts.id, id)); } catch { /* notification failures must stay non-fatal */ }
  }
}
