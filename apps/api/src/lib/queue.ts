import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "@samarth-mess/config";
import { logger } from "./logger.js";

export const QUEUE_NAME = "samarth-mess-operations";
const connection = new IORedis(config.redis.url, { maxRetriesPerRequest: null, enableOfflineQueue: false, lazyConnect: true });
export const operationsQueue = new Queue(QUEUE_NAME, { connection, defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 100, removeOnFail: 1000 } });

export async function enqueueInvoiceDelivery(invoiceId: string, fallback: () => Promise<void>): Promise<void> {
  try {
    await operationsQueue.add("invoice-delivery", { invoiceId }, { jobId: `invoice-${invoiceId}` });
  } catch (error) {
    logger.warn("queue_unavailable_fallback", { job: "invoice-delivery", invoiceId, error: error instanceof Error ? error.message : String(error) });
    await fallback();
  }
}
