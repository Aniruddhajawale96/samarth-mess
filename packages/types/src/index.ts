export type UserRole = "USER" | "OWNER" | "ADMIN";
export type UserType = "STUDENT" | "PROFESSIONAL";
export type AccountStatus = "ACTIVE" | "DISABLED";

export type MessStatus = "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL";

export type SubscriptionStatus =
  | "PENDING_PAYMENT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type MenuStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";

export type MealBookingStatus = "BOOKED" | "SKIPPED" | "EXTRA" | "CANCELLED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXTRA";
export type AttendanceMethod = "QR" | "MANUAL";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
export type PaymentProvider = "RAZORPAY" | "CASH" | "UPI_MANUAL";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  userType: UserType;
  profilePhotoUrl?: string | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MessProfile {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  address: string;
  contact: string;
  monthlyPrice: number;
  mealsPerDay: number;
  status: MessStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
