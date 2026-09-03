import { randomUUID, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { and, eq } from "drizzle-orm";
import { db, menuItems, menus, messes, subscriptions, users } from "./index.js";

const scrypt = promisify(scryptCallback);
const DEMO_PASSWORD = "DemoPass123!";
const ids = {
  admin: "00000000-0000-4000-8000-000000000001",
  owner: "00000000-0000-4000-8000-000000000002",
  user: "00000000-0000-4000-8000-000000000003",
  userTwo: "00000000-0000-4000-8000-000000000004",
  mess: "00000000-0000-4000-8000-000000000010",
  menu: "00000000-0000-4000-8000-000000000011",
  pendingSubscription: "00000000-0000-4000-8000-000000000020",
  activeSubscription: "00000000-0000-4000-8000-000000000021"
} as const;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

async function seed() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  await db.insert(users).values([
    { id: ids.admin, name: "Demo Admin", phone: "9000000001", email: "admin.demo@samarth.local", passwordHash, role: "ADMIN", userType: "PROFESSIONAL" },
    { id: ids.owner, name: "Demo Owner", phone: "9000000002", email: "owner.demo@samarth.local", passwordHash, role: "OWNER", userType: "PROFESSIONAL" },
    { id: ids.user, name: "Demo Student", phone: "9000000003", email: "student.demo@samarth.local", passwordHash, role: "USER", userType: "STUDENT", qrToken: "demo-qr-token-student-00000001" },
    { id: ids.userTwo, name: "Demo Professional", phone: "9000000004", email: "professional.demo@samarth.local", passwordHash, role: "USER", userType: "PROFESSIONAL", qrToken: "demo-qr-token-professional-0001" }
  ]).onConflictDoNothing();

  await db.insert(messes).values({
    id: ids.mess,
    ownerId: ids.owner,
    name: "Demo Samarth Mess",
    description: "Clearly identified demo data for local testing.",
    address: "Demo Campus, Pune",
    contact: "9000000010",
    monthlyPrice: 2500,
    mealsPerDay: 3,
    skipCutoffMinutes: 120,
    status: "ACTIVE"
  }).onConflictDoNothing();

  await db.insert(menus).values({ id: ids.menu, messId: ids.mess, status: "PUBLISHED", startDate: new Date(), endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) }).onConflictDoNothing();
  await db.insert(menuItems).values([
    { id: "00000000-0000-4000-8000-000000000012", menuId: ids.menu, mealType: "BREAKFAST", itemName: "Poha and Tea", displayOrder: 1 },
    { id: "00000000-0000-4000-8000-000000000013", menuId: ids.menu, mealType: "LUNCH", itemName: "Dal, Rice and Sabzi", displayOrder: 2 },
    { id: "00000000-0000-4000-8000-000000000014", menuId: ids.menu, mealType: "DINNER", itemName: "Roti and Paneer", displayOrder: 3 }
  ]).onConflictDoNothing();

  await db.insert(subscriptions).values([
    { id: ids.pendingSubscription, userId: ids.user, messId: ids.mess, status: "PENDING_PAYMENT", autoRenew: false },
    { id: ids.activeSubscription, userId: ids.userTwo, messId: ids.mess, status: "ACTIVE", autoRenew: true, startDate: new Date() }
  ]).onConflictDoNothing();

  console.log(`Demo seed ready. Login password: ${DEMO_PASSWORD}`);
}

seed().catch((error) => {
  console.error("Demo seed failed", error);
  process.exitCode = 1;
}).finally(() => db.$client.end());
