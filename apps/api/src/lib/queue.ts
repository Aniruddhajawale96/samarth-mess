import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "@samarth-mess/config";
import { logger } from "./logger.js";

export const QUEUE_NAME = "samarth-mess-operations";

let _queue: Queue | null = null;
let _connection: IORedis | null = null;

function getQueue(): Queue | null {
  if (_queue) return _queue;
  try {
    _connection = new IORedis(config.redis.url, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: () => null,
    });
    _connection.on("error", () => {
      // Graceful ignore in dev
    });
    _queue = new Queue(QUEUE_NAME, {
      connection: _connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    });
    return _queue;
  } catch {
    return null;
  }
}

export const operationsQueue = {
  async add(name: string, data: any, opts?: any) {
    const q = getQueue();
    if (!q) throw new Error("Queue not available");
    return q.add(name, data, opts);
  },
  async close() {
    if (_queue) await _queue.close();
    if (_connection) await _connection.quit().catch(() => {});
  },
};

export async function closeOperationsQueue(): Promise<void> {
  await operationsQueue.close();
}

export async function enqueueInvoiceDelivery(invoiceId: string, fallback: () => Promise<void>): Promise<void> {
  try {
    await operationsQueue.add("invoice-delivery", { invoiceId }, { jobId: `invoice-${invoiceId}` });
  } catch (error) {
    logger.warn("queue_unavailable_fallback", { job: "invoice-delivery", invoiceId, error: error instanceof Error ? error.message : String(error) });
    await fallback();
  }
}
