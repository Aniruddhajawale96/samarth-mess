import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { invoices, payments, users, messes } from "@samarth-mess/db";

type DbLike = { select: typeof import("@samarth-mess/db").db.select; insert: typeof import("@samarth-mess/db").db.insert };

function pdfText(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function invoicePdf(lines: string[]): Buffer {
  const content = ["BT", "/F1 12 Tf", "50 780 Td", ...lines.flatMap((line, index) => [index === 0 ? `(${pdfText(line)}) Tj` : "0 -20 Td", index === 0 ? "" : `(${pdfText(line)}) Tj`]), "ET"].filter(Boolean).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

export async function ensureInvoice(tx: DbLike, paymentId: string) {
  const [existing] = await tx.select().from(invoices).where(eq(invoices.paymentId, paymentId)).limit(1);
  if (existing) return existing;

  const [row] = await tx.select({ payment: payments, user: users, mess: messes })
    .from(payments)
    .innerJoin(users, eq(users.id, payments.userId))
    .innerJoin(messes, eq(messes.id, payments.messId))
    .where(and(eq(payments.id, paymentId), eq(payments.status, "SUCCESS")))
    .limit(1);
  if (!row) return undefined;

  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${paymentId.slice(0, 8).toUpperCase()}`;
  const filename = `${invoiceNumber}-${randomUUID()}.pdf`;
  const directory = path.resolve("uploads", "invoices");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), invoicePdf([
    "Samarth Mess Invoice",
    `Invoice number: ${invoiceNumber}`,
    `Customer: ${row.user.name}`,
    `Phone: ${row.user.phone}`,
    `Mess: ${row.mess.name}`,
    `Amount: ${row.payment.currency} ${row.payment.amount}`,
    `Payment status: ${row.payment.status}`,
    `Payment date: ${(row.payment.paidAt ?? row.payment.createdAt).toISOString()}`,
    `Payment ID: ${row.payment.id}`
  ]));
  const [invoice] = await tx.insert(invoices).values({
    id: randomUUID(),
    paymentId,
    invoiceNumber,
    fileUrl: `/uploads/invoices/${filename}`,
    metadata: { customerName: row.user.name, messName: row.mess.name, amount: row.payment.amount, currency: row.payment.currency }
  }).onConflictDoNothing({ target: invoices.paymentId }).returning();
  if (invoice) return invoice;
  const [raceWinner] = await tx.select().from(invoices).where(eq(invoices.paymentId, paymentId)).limit(1);
  return raceWinner;
}
