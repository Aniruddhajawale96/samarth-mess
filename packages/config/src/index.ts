import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiUrl: string;
  frontendUrl: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  whatsappApiKey?: string;
}

export function loadConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const port = parseInt(process.env.PORT || "4000", 10);
  const apiUrl = process.env.API_URL || `http://localhost:${port}`;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/samarth_mess";
  const jwtSecret =
    process.env.JWT_SECRET || "development_secret_key_change_in_production";
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return {
    nodeEnv,
    port,
    apiUrl,
    frontendUrl,
    databaseUrl,
    jwtSecret,
    jwtExpiresIn,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    whatsappApiKey: process.env.WHATSAPP_API_KEY
  };
}

export const config = loadConfig();
