/** users.ts — maps to /users/me* backend routes */
import { api } from "./client";
import type { AuthUser } from "./auth";

export interface ProfileUpdateInput {
  name?: string;
  email?: string;
}

/** GET /users/me */
export function getProfile() {
  return api.get<{ user: AuthUser }>("/users/me");
}

/** PATCH /users/me */
export function updateProfile(input: ProfileUpdateInput) {
  return api.patch<{ user: AuthUser }>("/users/me", input);
}

/**
 * POST /users/me/profile-photo
 * Uses multipart/form-data — DO NOT send Content-Type: application/json.
 * Field name expected by backend upload middleware: "photo"
 */
export function uploadProfilePhoto(file: File) {
  const form = new FormData();
  form.append("photo", file);
  return api.postForm<{ profilePhotoUrl: string; user: { id: string; profilePhotoUrl: string | null } }>(
    "/users/me/profile-photo",
    form,
  );
}
