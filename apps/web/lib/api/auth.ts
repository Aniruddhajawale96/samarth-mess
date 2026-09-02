/** auth.ts — maps to /auth/* backend routes */
import { api } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: "USER" | "OWNER" | "ADMIN";
  status: "ACTIVE" | "DISABLED";
  qrToken: string | null;
  profilePhotoUrl: string | null;
  userType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: "USER" | "OWNER";
}

export interface LoginInput {
  phone?: string;
  email?: string;
  password: string;
}

/** POST /auth/register */
export function register(input: RegisterInput) {
  return api.post<{ user: AuthUser; token?: string }>("/auth/register", input);
}

/** POST /auth/login */
export function login(input: LoginInput) {
  return api.post<{ user: AuthUser; token?: string }>("/auth/login", input);
}

/** POST /auth/logout */
export function logout() {
  return api.post<{ loggedOut: boolean }>("/auth/logout");
}

/** GET /auth/me */
export function getMe() {
  return api.get<{ user: AuthUser }>("/auth/me");
}

// TODO: POST /auth/verify-phone — backend returns 501 Not Implemented
