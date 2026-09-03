/**
 * lib/auth/session.ts
 * Client-side session utilities.
 * Source of truth is always /auth/me — we never decide auth on the client.
 */
import { getMe } from "../api/auth";
import type { AuthUser } from "../api/auth";
import { ApiError } from "../api/client";

export type UserRole = "USER" | "OWNER" | "ADMIN";

export interface Session {
  user: AuthUser;
  role: UserRole;
  isLoggedIn: true;
}

export interface NoSession {
  user: null;
  role: null;
  isLoggedIn: false;
}

export type SessionResult = Session | NoSession;

/**
 * Fetch the current session from the server.
 * Returns null if the user is not authenticated.
 * Never throws — callers can treat null as "not logged in".
 */
export async function fetchSession(): Promise<SessionResult> {
  try {
    const { user } = await getMe();
    return { user, role: user.role as UserRole, isLoggedIn: true };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return { user: null, role: null, isLoggedIn: false };
    }
    // Network errors (e.g. ECONNREFUSED at build time) — treat as not logged in
    // so layouts can redirect to /login instead of crashing the prerender.
    return { user: null, role: null, isLoggedIn: false };
  }
}
