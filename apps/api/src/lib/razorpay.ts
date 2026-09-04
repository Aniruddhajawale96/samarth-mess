/**
 * apps/api/src/lib/razorpay.ts
 *
 * Server-side Razorpay Orders API client.
 *
 * The checkout SDK requires a REAL order created through the Razorpay Orders API.
 * Previously the API fabricated `order_<uuid>` ids, which Razorpay rejects —
 * and because an order could never exist, the payment could not be verified
 * against an authoritative amount.
 *
 * Amounts are stored in the DB in whole INR rupees (see schema comments); the
 * Razorpay API expects amounts in paise, so conversion happens ONLY at this
 * boundary (rupees * 100). The webhook handler compares Razorpay's paise
 * payloads against rupees * 100 too.
 */

import { config } from "@samarth-mess/config";
import { logger } from "./logger.js";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export class RazorpayError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "RazorpayError";
  }
}

function authHeader(): { authorization: string } {
  const keyId = config.payment.razorpayKeyId;
  const keySecret = config.payment.razorpayKeySecret;
  if (!keyId || !keySecret) {
    throw new RazorpayError("Razorpay is not configured");
  }
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return { authorization: `Basic ${credentials}` };
}

/**
 * Create a real Razorpay order and return its id.
 *
 * @param input.amountInPaise - order amount in paise (DB rupees * 100)
 * @returns the Razorpay `order_...` id
 * @throws RazorpayError when the provider is missing, unreachable, or rejects
 */
export async function createRazorpayOrder(input: {
  amountInPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<string> {
  const headers = authHeader();
  let response: Response;
  try {
    response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountInPaise,
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes ?? {},
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    logger.error("razorpay_order_network_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new RazorpayError("Razorpay order could not be created (network error)");
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    logger.error("razorpay_order_rejected", {
      status: response.status,
      detail,
    });
    throw new RazorpayError(`Razorpay order could not be created (HTTP ${response.status})`, response.status);
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new RazorpayError("Razorpay order response did not include an order id");
  }
  return data.id;
}
