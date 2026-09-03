import { Worker } from "bullmq";
import IORedis from "ioredis";
import { config } from "@samarth-mess/config";
import { logger } from "./lib/logger.js";
import { deliverInvoice } from "./lib/whatsapp.js";
import { QUEUE_NAME } from "./lib/queue.js";

const connection = new IORedis(config.redis.url, { maxRetriesPerRequest: null });
const worker = new Worker(QUEUE_NAME, async (job) => {
  if (job.name === "invoice-delivery") await deliverInvoice((job.data as { invoiceId: string }).invoiceId);
}, { connection, concurrency: 2 });

worker.on("completed", (job) => logger.info("job_completed", { jobId: job.id, job: job.name }));
worker.on("failed", (job, error) => logger.error("job_failed", { jobId: job?.id, job: job?.name, error: error.message }));
logger.info("worker_started", { queue: QUEUE_NAME, redisUrl: config.redis.url.replace(/:\/\/.*@/, "://***@") });

async function shutdown() { await worker.close(); await connection.quit(); }
process.once("SIGINT", () => void shutdown().then(() => process.exit(0)));
process.once("SIGTERM", () => void shutdown().then(() => process.exit(0)));
