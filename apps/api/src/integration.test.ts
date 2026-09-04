import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { createApp } from "./app.js";
import { db, users } from "@samarth-mess/db";
import { eq } from "drizzle-orm";
import { closeOperationsQueue } from "./lib/queue.js";

const suffix = randomUUID().replaceAll("-", "").slice(0, 8);
const ownerPhone = `9${suffix.replace(/[^0-9]/g, "").padEnd(9, "0").slice(0, 9)}`;
const userPhone = `8${suffix.replace(/[^0-9]/g, "").padEnd(9, "0").slice(0, 9)}`;
const password = "JourneyPass123!";
const createdUserIds: string[] = [];

const app = createApp();
const server = await new Promise<ReturnType<typeof app.listen>>((resolve, reject) => {
  const httpServer = app.listen(0, "127.0.0.1");
  httpServer.once("listening", () => resolve(httpServer));
  httpServer.once("error", reject);
});
const address = server.address();
if (!address || typeof address === "string") throw new Error("Test server did not bind");
const testBase = `http://127.0.0.1:${address.port}`;

async function testRequest(path: string, options: { method?: string; token?: string; body?: unknown; headers?: Record<string, string> } = {}) {
  const result = await fetch(`${testBase}${path}`, {
    method: options.method ?? "GET",
    headers: { ...(options.token ? { authorization: `Bearer ${options.token}` } : {}), ...(options.body ? { "content-type": "application/json" } : {}), ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  return { response: result, json: await result.json() as { success: boolean; data?: any; error?: { code?: string } } };
}

function expectStatus(result: { response: Response; json: { success: boolean; [key: string]: any } }, status: number) {
  assert.equal(result.response.status, status, JSON.stringify(result.json));
  assert.equal(result.json.success, status < 400, JSON.stringify(result.json));
}

try {
  expectStatus(await testRequest("/health") as any, 200);
  const owner = await testRequest("/auth/register", { method: "POST", body: { name: "Journey Owner", phone: ownerPhone, email: `owner-${suffix}@test.local`, password, role: "OWNER", userType: "PROFESSIONAL" } });
  expectStatus(owner as any, 201);
  const ownerToken = owner.json.data.token as string;
  createdUserIds.push(owner.json.data.user.id);

  const user = await testRequest("/auth/register", { method: "POST", body: { name: "Journey User", phone: userPhone, email: `user-${suffix}@test.local`, password, role: "USER", userType: "STUDENT" } });
  expectStatus(user as any, 201);
  const userToken = user.json.data.token as string;
  const userId = user.json.data.user.id as string;
  createdUserIds.push(userId);
  const login = await testRequest("/auth/login", { method: "POST", body: { phone: userPhone, password } });
  expectStatus(login as any, 200);
  const profile = await testRequest("/users/me", { method: "PATCH", token: userToken, body: { userType: "PROFESSIONAL" } });
  expectStatus(profile as any, 200);

  const forbidden = await testRequest("/owner/access-check", { token: userToken });
  expectStatus(forbidden as any, 403);

  const messResult = await testRequest("/owner/messes", { method: "POST", token: ownerToken, body: { name: `Journey Mess ${suffix}`, description: "Integration test mess", address: "Test Campus, Pune", contact: "9000000011", monthlyPrice: 2400, mealsPerDay: 3, skipCutoffMinutes: 120 } });
  expectStatus(messResult as any, 201);
  const messId = messResult.json.data.mess.id as string;
  const today = new Date().toISOString().slice(0, 10);
  const menu = await testRequest("/owner/menus", { method: "POST", token: ownerToken, body: { messId, date: today, status: "PUBLISHED", items: [{ mealType: "BREAKFAST", name: "Poha", displayOrder: 1 }, { mealType: "LUNCH", name: "Dal Rice", displayOrder: 2 }] } });
  expectStatus(menu as any, 201);
  const discover = await testRequest("/messes?limit=100");
  expectStatus(discover as any, 200);
  assert.ok(discover.json.data.items.some((item: { id: string }) => item.id === messId));
  const menuView = await testRequest(`/messes/${messId}/menu?date=${today}`);
  expectStatus(menuView as any, 200);
  assert.equal(menuView.json.data.items.length, 2);

  const subscription = await testRequest(`/messes/${messId}/subscriptions`, { method: "POST", token: userToken, body: { autoRenew: false } });
  expectStatus(subscription as any, 201);
  const subscriptionId = subscription.json.data.subscription.id as string;
  const payment = await testRequest("/payments", { method: "POST", token: userToken, body: { subscriptionId } });
  expectStatus(payment as any, 201);
  const paymentId = payment.json.data.payment.id as string;
  const orderId = payment.json.data.payment.providerOrderId as string;
  const providerPaymentId = `pay_${suffix}`;
  const signature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(`${orderId}|${providerPaymentId}`).digest("hex");
  const verified = await testRequest(`/payments/${paymentId}/verify`, { method: "POST", token: userToken, body: { providerPaymentId, providerOrderId: orderId, signature } });
  expectStatus(verified as any, 200);
  const pending = await testRequest("/owner/subscriptions/pending", { token: ownerToken });
  expectStatus(pending as any, 200);
  const approved = await testRequest(`/owner/subscriptions/${subscriptionId}/approve`, { method: "POST", token: ownerToken });
  expectStatus(approved as any, 200);
  const ownerDashboard = await testRequest("/owner/dashboard", { token: ownerToken });
  expectStatus(ownerDashboard as any, 200);
  const ownerCustomers = await testRequest("/owner/customers?limit=100", { token: ownerToken });
  expectStatus(ownerCustomers as any, 200);
  assert.ok(ownerCustomers.json.data.items.some((item: { user: { id: string } }) => item.user.id === userId));

  const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const booking = await testRequest("/bookings", { method: "POST", token: userToken, body: { messId, date: future, mealType: "LUNCH", status: "BOOKED" } });
  expectStatus(booking as any, 201);
  const earlySkip = await testRequest("/bookings", { method: "POST", token: userToken, body: { messId, date: future, mealType: "DINNER", status: "SKIPPED" } });
  expectStatus(earlySkip as any, 201);
  const attendance = await testRequest("/owner/attendance/manual", { method: "POST", token: ownerToken, body: { messId, date: future, records: [{ userId, mealType: "LUNCH", status: "PRESENT" }] } });
  expectStatus(attendance as any, 201);
  const qr = await testRequest("/users/me/qr", { token: userToken });
  expectStatus(qr as any, 200);
  const qrAttendance = await testRequest("/owner/attendance/qr", { method: "POST", token: ownerToken, body: { messId, date: future, mealType: "DINNER", token: qr.json.data.token } });
  expectStatus(qrAttendance as any, 201);
  const history = await testRequest("/users/me/history", { token: userToken });
  expectStatus(history as any, 200);
  assert.ok(history.json.data.bookings.length > 0 && history.json.data.attendance.length > 0);
  const extraMeal = await testRequest("/extra-meals", { method: "POST", token: userToken, body: { messId, date: future, mealType: "BREAKFAST" } });
  expectStatus(extraMeal as any, 201);

  const todayBooking = await testRequest("/bookings", { method: "POST", token: userToken, body: { messId, date: today, mealType: "BREAKFAST", status: "BOOKED" } });
  expectStatus(todayBooking as any, 201);
  const afterCutoff = await testRequest(`/bookings/${todayBooking.json.data.booking.id}`, { method: "PATCH", token: userToken, body: { status: "SKIPPED" } });
  expectStatus(afterCutoff as any, 409);
  // Razorpay reports amounts in paise; the DB stores whole rupees (2400 => 240000 paise).
  const webhookBody = { eventId: `evt_${suffix}`, event: "payment.captured", payment: { id: providerPaymentId, orderId, status: "captured", amount: 2400 * 100 } };
  const webhookSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(JSON.stringify(webhookBody)).digest("hex");
  const firstWebhook = await testRequest("/webhooks/payment", { method: "POST", body: webhookBody, headers: { "x-razorpay-signature": webhookSignature } });
  assert.equal(firstWebhook.response.status, 200, JSON.stringify(firstWebhook.json));
  const duplicateWebhook = await testRequest("/webhooks/payment", { method: "POST", body: webhookBody, headers: { "x-razorpay-signature": webhookSignature } });
  assert.equal(duplicateWebhook.response.status, 200, JSON.stringify(duplicateWebhook.json));
  assert.equal(duplicateWebhook.json.data.duplicate, true);

  const invoice = await testRequest(`/payments/${paymentId}/invoice`, { token: userToken });
  expectStatus(invoice as any, 200);
  assert.ok(invoice.json.data.invoice.invoiceNumber);
  const admin = await testRequest("/auth/login", { method: "POST", body: { phone: "9000000001", password: "DemoPass123!" } });
  expectStatus(admin as any, 200);
  const adminToken = admin.json.data.token as string;
  expectStatus(await testRequest("/admin/access", { token: adminToken }) as any, 200);
  expectStatus(await testRequest("/admin/users?role=OWNER", { token: adminToken }) as any, 200);
  expectStatus(await testRequest("/admin/users?role=USER", { token: adminToken }) as any, 200);
  expectStatus(await testRequest("/admin/audit?limit=20", { token: adminToken }) as any, 200);
  const disabled = await testRequest(`/admin/users/${userId}/status`, { method: "PATCH", token: adminToken, body: { status: "DISABLED" } });
  expectStatus(disabled as any, 200);
  expectStatus(await testRequest(`/admin/users/${userId}/status`, { method: "PATCH", token: adminToken, body: { status: "ACTIVE" } }) as any, 200);
  console.log("core journey, authorization, booking rules, attendance, and idempotency tests passed");
} finally {
  for (const id of createdUserIds) await db.delete(users).where(eq(users.id, id));
  server.close();
  await closeOperationsQueue();
  await db.$client.end();
  process.exit(0);
}
