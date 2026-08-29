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
export type WhatsAppStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";

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

export interface SubscriptionRecord {
  id: string;
  userId: string;
  messId: string;
  status: SubscriptionStatus;
  startDate?: string | null;
  endDate?: string | null;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealBookingRecord {
  id: string;
  userId: string;
  messId: string;
  date: string;
  mealType: MealType;
  status: MealBookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  messId: string;
  date: string;
  mealType: MealType;
  status: AttendanceStatus;
  method: AttendanceMethod;
  markedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  messId: string;
  subscriptionId?: string | null;
  provider: PaymentProvider;
  providerPaymentId?: string | null;
  providerOrderId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  fileUrl?: string | null;
  whatsappStatus: WhatsAppStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEventRecord {
  id: string;
  actorId?: string | null;
  actorRole?: UserRole | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
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
