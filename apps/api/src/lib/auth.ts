import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { config } from "@samarth-mess/config";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "samarth_access_token";
const PASSWORD_PREFIX = "scrypt";
const revokedTokens = new Set<string>();

export interface AuthClaims {
  sub: string;
  role: "USER" | "OWNER" | "ADMIN";
  iat: number;
  exp: number;
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function expirySeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60;
  const amount = Number(match[1]);
  return amount * ({ s: 1, m: 60, h: 3600, d: 86400 } as const)[match[2] as "s" | "m" | "h" | "d"];
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${PASSWORD_PREFIX}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [prefix, saltValue, hashValue] = encoded.split("$");
  if (prefix !== PASSWORD_PREFIX || !saltValue || !hashValue) return false;
  try {
    const expected = Buffer.from(hashValue, "base64url");
    const actual = (await scrypt(password, Buffer.from(saltValue, "base64url"), expected.length)) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function signToken(claims: Pick<AuthClaims, "sub" | "role">): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthClaims = { ...claims, iat: now, exp: now + expirySeconds(config.auth.jwtExpiresIn) };
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", config.auth.jwtSecret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): AuthClaims | null {
  if (revokedTokens.has(token)) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = createHmac("sha256", config.auth.jwtSecret).update(`${header}.${body}`).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AuthClaims;
    if (!claims.sub || !claims.role || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

export function getAccessToken(req: { headers: { authorization?: string | string[] }; headersCookie?: string }): string | null {
  const authorization = req.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) return authorization.slice(7).trim();
  const cookieHeader = req.headersCookie ?? "";
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return cookie ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)) : null;
}

export function setAuthCookie(res: { setHeader(name: string, value: string): void }, token: string): void {
  const maxAge = expirySeconds(config.auth.jwtExpiresIn);
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${config.isProduction ? "; Secure" : ""}`);
}

export function clearAuthCookie(res: { setHeader(name: string, value: string): void }): void {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${config.isProduction ? "; Secure" : ""}`);
}
