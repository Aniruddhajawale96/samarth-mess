import { and, eq } from "drizzle-orm";
import { config } from "@samarth-mess/config";
import { db, invoices, messes, payments, users } from "@samarth-mess/db";
import { logger } from "./logger.js";

export interface InvoiceDocumentMessage {
  recipient: string;
  invoiceNumber: string;
  invoiceUrl: string;
  filename: string;
  caption: string;
}

export interface WhatsAppProvider {
  sendInvoiceDocument(message: InvoiceDocumentMessage): Promise<void>;
}

class GraphWhatsAppProvider implements WhatsAppProvider {
  async sendInvoiceDocument(message: InvoiceDocumentMessage): Promise<void> {
    const apiKey = config.whatsapp.apiKey;
    const phoneNumberId = config.whatsapp.phoneNumberId;
    if (!apiKey || !phoneNumberId) throw new Error("WhatsApp provider is not configured");
    const response = await fetch(`${config.whatsapp.apiUrl}/${phoneNumberId}/messages`, {
      signal: AbortSignal.timeout(10000),
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: message.recipient,
        type: "document",
        document: { link: message.invoiceUrl, filename: message.filename, caption: message.caption }
      })
    });
    if (!response.ok) throw new Error(`WhatsApp provider returned HTTP ${response.status}`);
  }
}

export const whatsappProvider: WhatsAppProvider = new GraphWhatsAppProvider();
const inFlight = new Set<string>();

export async function deliverInvoice(invoiceId: string): Promise<void> {
  if (inFlight.has(invoiceId)) return;
  inFlight.add(invoiceId);
  try {
    const [row] = await db.select({ invoice: invoices, payment: payments, user: users, mess: messes })
      .from(invoices)
      .innerJoin(payments, eq(payments.id, invoices.paymentId))
      .innerJoin(users, eq(users.id, payments.userId))
      .innerJoin(messes, eq(messes.id, payments.messId))
      .where(and(eq(invoices.id, invoiceId), eq(payments.status, "SUCCESS")))
      .limit(1);
    if (!row || row.invoice.whatsappStatus === "SENT" || row.invoice.whatsappStatus === "DELIVERED") return;
    if (!row.invoice.fileUrl) throw new Error("Invoice document is unavailable");
    const invoiceUrl = new URL(row.invoice.fileUrl, config.server.apiUrl).toString();
    await whatsappProvider.sendInvoiceDocument({
      recipient: row.user.phone,
      invoiceNumber: row.invoice.invoiceNumber,
      invoiceUrl,
      filename: `${row.invoice.invoiceNumber}.pdf`,
      caption: `${row.mess.name} payment invoice ${row.invoice.invoiceNumber}`
    });
    await db.update(invoices).set({ whatsappStatus: "SENT", updatedAt: new Date() }).where(eq(invoices.id, invoiceId));
  } catch (error) {
    await db.update(invoices).set({ whatsappStatus: "FAILED", updatedAt: new Date() }).where(eq(invoices.id, invoiceId)).catch((updateError) => {
      logger.error("invoice_delivery_status_update_failed", { invoiceId, error: updateError instanceof Error ? updateError.message : String(updateError) });
    });
    logger.error("invoice_delivery_failed", { invoiceId, error: error instanceof Error ? error.message : String(error) });
  } finally {
    inFlight.delete(invoiceId);
  }
}
