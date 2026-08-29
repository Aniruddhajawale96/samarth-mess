import { randomUUID } from "node:crypto";
import { auditEvents, db } from "@samarth-mess/db";
import { logger } from "./logger.js";

export async function recordAudit(input: {
  actorId?: string;
  actorRole?: "USER" | "OWNER" | "ADMIN";
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(auditEvents).values({ id: randomUUID(), ...input });
  } catch (error) {
    logger.error("audit_write_failed", { action: input.action, entityType: input.entityType, entityId: input.entityId, error: error instanceof Error ? error.message : String(error) });
  }
}
