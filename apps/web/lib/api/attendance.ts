/** attendance.ts — maps to /attendance/me backend route */
import { api } from "./client";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXTRA";
export type AttendanceMethod = "QR" | "MANUAL";

export interface AttendanceRecord {
  id: string;
  userId: string;
  messId: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  status: AttendanceStatus;
  method: AttendanceMethod;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceQuery {
  messId?: string;
  date?: string;
}

/** GET /attendance/me */
export function getMyAttendance(query: AttendanceQuery = {}) {
  return api.get<{ items: AttendanceRecord[] }>("/attendance/me", {
    messId: query.messId,
    date: query.date,
  });
}
