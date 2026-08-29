/**
 * packages/config/src/index.ts
 *
 * Validated application configuration using Zod.
 *
 * Rules:
 *  - Fails fast on missing / invalid required configuration.
 *  - Never silently falls back to insecure values in production.
 *  - Never logs secrets.
 *
 * Usage:
 *   import { config } from "@samarth-mess/config";
 */

import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env" });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INSECURE_SECRETS = [
  "development_secret_key_change_in_production",
  "super_secret_jwt_key_change_in_production",
  "REPLACE_WITH_A_RANDOM_32_PLUS_CHARACTER_SECRET",
  "changeme",
  "secret",
  "rzp_test_placeholder",
  "placeholder_secret",
  "placeholder_api_key",
  "placeholder_number_id",
];

function notInsecureInProduction(value: string | undefined) {
  if (!value) return true;
  const nodeEnv = process.env["NODE_ENV"] ?? "development";
  if (nodeEnv === "production" && INSECURE_SECRETS.includes(value)) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const envSchema = z
  .object({
    // ── Runtime ─────────────────────────────────────────────────────────────
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // ── Server ──────────────────────────────────────────────────────────────
    PORT: z.coerce.number().int().positive().default(4000),
    API_URL: z.string().url().default("http://localhost:4000"),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),

    // ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required")
      .refine(
        (v) =>
          v.startsWith("postgres://") || v.startsWith("postgresql://"),
        { message: "DATABASE_URL must be a valid PostgreSQL connection string" }
      ),

    // ── Auth ─────────────────────────────────────────────────────────────────
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters")
      .refine(notInsecureInProduction, {
        message: "JWT_SECRET must not use a placeholder value in production",
      }),

    JWT_EXPIRES_IN: z.string().min(1).default("7d"),

    // ── Session / Cookie ─────────────────────────────────────────────────────
    COOKIE_SECRET: z
      .string()
      .min(32, "COOKIE_SECRET must be at least 32 characters")
      .refine(notInsecureInProduction, {
        message: "COOKIE_SECRET must not use a placeholder value in production",
      })
      .optional(),

    // ── Payment (optional) ───────────────────────────────────────────────────
    RAZORPAY_KEY_ID: z.string().optional().refine(notInsecureInProduction, "RAZORPAY_KEY_ID must not use a placeholder in production"),
    RAZORPAY_KEY_SECRET: z.string().optional().refine(notInsecureInProduction, "RAZORPAY_KEY_SECRET must not use a placeholder in production"),

    // ── WhatsApp (optional) ──────────────────────────────────────────────────
    WHATSAPP_API_KEY: z.string().optional().refine(notInsecureInProduction, "WHATSAPP_API_KEY must not use a placeholder in production"),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional().refine(notInsecureInProduction, "WHATSAPP_PHONE_NUMBER_ID must not use a placeholder in production"),
    WHATSAPP_API_URL: z.string().url().default("https://graph.facebook.com/v20.0"),

    // ── Storage (optional) ───────────────────────────────────────────────────
    STORAGE_BUCKET: z.string().optional(),
    STORAGE_REGION: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (Boolean(data.RAZORPAY_KEY_ID) !== Boolean(data.RAZORPAY_KEY_SECRET)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Razorpay key ID and secret must be configured together", path: [data.RAZORPAY_KEY_ID ? "RAZORPAY_KEY_SECRET" : "RAZORPAY_KEY_ID"] });
    }
    if (Boolean(data.WHATSAPP_API_KEY) !== Boolean(data.WHATSAPP_PHONE_NUMBER_ID)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "WhatsApp API key and phone number ID must be configured together", path: [data.WHATSAPP_API_KEY ? "WHATSAPP_PHONE_NUMBER_ID" : "WHATSAPP_API_KEY"] });
    }
    if (Boolean(data.STORAGE_BUCKET) !== Boolean(data.STORAGE_REGION)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Storage bucket and region must be configured together", path: [data.STORAGE_BUCKET ? "STORAGE_REGION" : "STORAGE_BUCKET"] });
    }
    // Extra cross-field production rules
    if (data.NODE_ENV === "production") {
      if (!data.COOKIE_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "COOKIE_SECRET is required in production",
          path: ["COOKIE_SECRET"],
        });
      }
    }
  });

// ---------------------------------------------------------------------------
// Parse & export
// ---------------------------------------------------------------------------

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.errors
      .map((e) => `  • ${e.path.join(".")}: ${e.message}`)
      .join("\n");

    // Intentionally NOT logging process.env to avoid leaking secrets.
    console.error(
      `\n[config] ❌ Invalid environment configuration:\n${formatted}\n\n` +
        `Fix the above values (see .env.example) and restart the application.\n`
    );

    process.exit(1);
  }

  return result.data;
}

const env = parseEnv();

// ---------------------------------------------------------------------------
// Typed config object (camelCase)
// ---------------------------------------------------------------------------

export const config = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  isDevelopment: env.NODE_ENV === "development",
  isTest: env.NODE_ENV === "test",

  server: {
    port: env.PORT,
    apiUrl: env.API_URL,
    frontendUrl: env.FRONTEND_URL,
  },

  database: {
    url: env.DATABASE_URL,
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    cookieSecret: env.COOKIE_SECRET,
  },

  payment: {
    razorpayKeyId: env.RAZORPAY_KEY_ID,
    razorpayKeySecret: env.RAZORPAY_KEY_SECRET,
  },

  whatsapp: {
    apiKey: env.WHATSAPP_API_KEY,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    apiUrl: env.WHATSAPP_API_URL,
  },

  storage: {
    bucket: env.STORAGE_BUCKET,
    region: env.STORAGE_REGION,
  },
} as const;

export type Config = typeof config;
