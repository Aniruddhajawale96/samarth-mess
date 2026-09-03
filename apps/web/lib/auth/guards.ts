/**
 * lib/auth/guards.ts
 * Client-side route access helpers.
 *
 * These are UX helpers only — the backend enforces real authorization.
 * Never use these as a security boundary.
 */
import type { UserRole } from "./session";

/** Returns true if the given role is allowed access to a route requiring one of allowedRoles */
export function hasRole(role: UserRole | null, ...allowedRoles: UserRole[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}

/** True if user can access USER-only routes */
export function isUser(role: UserRole | null): boolean {
  return role === "USER";
}

/** True if user can access OWNER-only routes */
export function isOwner(role: UserRole | null): boolean {
  return role === "OWNER";
}

/** True if user can access ADMIN-only routes */
export function isAdmin(role: UserRole | null): boolean {
  return role === "ADMIN";
}

/** Returns the default redirect path for a given role */
export function defaultPathForRole(role: UserRole | null): string {
  switch (role) {
    case "ADMIN": return "/admin";
    case "OWNER": return "/owner";
    case "USER": return "/dashboard";
    default: return "/login";
  }
}
