/** messes.ts — maps to /messes/* backend routes */
import { api } from "./client";

export interface MessRecord {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  rating: null;
  distance: null;
  address: string | null;
  contact: string | null;
  monthlyPrice: number;
  mealsPerDay: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuPreviewItem {
  menuId: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  itemName: string;
  description: string | null;
  displayOrder: number;
}

export interface MessListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

/** GET /messes — paginated list of ACTIVE messes */
export function getMesses(query: MessListQuery = {}) {
  return api.get<{ items: MessRecord[]; page: number; limit: number }>("/messes", {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    search: query.search,
  });
}

/** GET /messes/:messId — single mess + today's menu preview */
export function getMess(messId: string, date?: string) {
  return api.get<{ mess: MessRecord; date: string; menuPreview: MenuPreviewItem[] }>(
    `/messes/${messId}`,
    date ? { date } : undefined,
  );
}

/** GET /messes/:messId/menu — published menu items for a date */
export function getMessMenu(messId: string, date?: string) {
  return api.get<{ date: string; items: MenuPreviewItem[] }>(
    `/messes/${messId}/menu`,
    date ? { date } : undefined,
  );
}
