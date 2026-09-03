/** menus.ts — maps to /owner/menus/* backend routes */
import { api } from "./client";

export type MenuStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface MenuItem {
  id: string;
  menuId: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  itemName: string;
  description: string | null;
  image: string | null;
  displayOrder: number;
}

export interface MenuRecord {
  id: string;
  messId: string;
  status: MenuStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemInput {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  name: string;
  description?: string | null;
  image?: string | null;
  displayOrder: number;
}

export interface CreateMenuInput {
  messId: string;
  date: string;
  status: MenuStatus;
  items: MenuItemInput[];
}

export interface UpdateMenuInput {
  date?: string;
  status?: MenuStatus;
  items?: MenuItemInput[];
}

/** GET /owner/menus */
export function getOwnerMenus() {
  return api.get<{ items: Array<{ menu: MenuRecord; messName: string }> }>("/owner/menus");
}

/** GET /owner/menus/:menuId */
export function getOwnerMenu(menuId: string) {
  return api.get<{ menu: MenuRecord; items: MenuItem[] }>(`/owner/menus/${menuId}`);
}

/** POST /owner/menus */
export function createOwnerMenu(input: CreateMenuInput) {
  return api.post<{ menu: MenuRecord; items: MenuItem[] }>("/owner/menus", input);
}

/** PATCH /owner/menus/:menuId */
export function updateOwnerMenu(menuId: string, input: UpdateMenuInput) {
  return api.patch<{ menu: MenuRecord; items: MenuItem[] }>(`/owner/menus/${menuId}`, input);
}

/** POST /owner/menus/:menuId/publish */
export function publishOwnerMenu(menuId: string) {
  return api.post<{ menu: MenuRecord }>(`/owner/menus/${menuId}/publish`);
}

/** DELETE /owner/menus/:menuId — archives the menu (sets status=ARCHIVED) */
export function deleteOwnerMenu(menuId: string) {
  return api.delete<{ menu: MenuRecord }>(`/owner/menus/${menuId}`);
}
