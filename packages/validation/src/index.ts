import { z } from "zod";

export const UserRoleSchema = z.enum(["USER", "OWNER", "ADMIN"]);
export const PublicRegistrationRoleSchema = z.enum(["USER", "OWNER"]).default("USER");
export const UserTypeSchema = z.enum(["STUDENT", "PROFESSIONAL"]);
export const AccountStatusSchema = z.enum(["ACTIVE", "DISABLED"]);
export const MessStatusSchema = z.enum(["ACTIVE", "INACTIVE", "PENDING_APPROVAL"]);
export const MealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "DINNER"]);
export const AttendanceStatusSchema = z.enum(["PRESENT", "ABSENT", "EXTRA"]);
export const AttendanceMethodSchema = z.enum(["QR", "MANUAL"]);
export const PaymentProviderSchema = z.enum(["RAZORPAY", "CASH", "UPI_MANUAL"]);

export const IdSchema = z.string().trim().min(1, "ID is required").max(100);
export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");
export const PhoneSchema = z.string().trim().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number");
export const EmailSchema = z.string().trim().email("Invalid email format").optional().or(z.literal(""));
export const PasswordSchema = z.string().min(8, "Password must be at least 8 characters").max(128);

export const RegisterUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: PhoneSchema,
  email: EmailSchema,
  password: PasswordSchema,
  role: PublicRegistrationRoleSchema,
  userType: UserTypeSchema.default("STUDENT")
}).strict();

export const LoginUserSchema = z.object({
  phone: PhoneSchema,
  password: z.string().min(1, "Password is required").max(128)
}).strict();

export const ProfileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: EmailSchema,
  userType: UserTypeSchema.optional()
}).strict().refine((value) => Object.keys(value).length > 0, "At least one profile field is required");

const MessFields = {
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  address: z.string().trim().min(5).max(500),
  contact: PhoneSchema,
  monthlyPrice: z.number().int().nonnegative().max(10_000_000),
  mealsPerDay: z.number().int().min(1).max(4),
  skipCutoffMinutes: z.number().int().min(0).max(1440).default(120)
};
export const MessCreateSchema = z.object(MessFields).strict();
export const MessUpdateSchema = z.object(MessFields).partial().strict().refine((value) => Object.keys(value).length > 0);
export const MessStatusUpdateSchema = z.object({ status: MessStatusSchema }).strict();

export const MenuItemSchema = z.object({
  mealType: MealTypeSchema,
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).nullable().optional(),
  image: z.string().url().nullable().optional(),
  displayOrder: z.number().int().min(0).max(1000).default(0)
}).strict();
export const MenuCreateSchema = z.object({
  messId: IdSchema,
  date: DateSchema,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  items: z.array(MenuItemSchema).min(1).max(20)
}).strict();
export const MenuUpdateSchema = MenuCreateSchema.partial().extend({ items: z.array(MenuItemSchema).min(1).max(20).optional() }).strict();
export const MenuDateQuerySchema = z.object({ date: DateSchema.optional() }).strict();
export const MenuParamsSchema = z.object({ menuId: IdSchema }).strict();
export const MessParamsSchema = z.object({ messId: IdSchema }).strict();

export const SubscriptionOptionsSchema = z.object({ autoRenew: z.boolean().default(false) }).strict();
export const SubscriptionRequestSchema = z.object({ messId: IdSchema, autoRenew: z.boolean().default(false) }).strict();
export const BookingSchema = z.object({
  messId: IdSchema,
  date: DateSchema,
  mealType: MealTypeSchema,
  status: z.enum(["BOOKED", "SKIPPED", "EXTRA", "CANCELLED"]).default("BOOKED")
}).strict();
export const BookingUpdateSchema = z.object({ status: z.enum(["BOOKED", "SKIPPED", "CANCELLED"]) }).strict();
export const BookingParamsSchema = z.object({ bookingId: IdSchema }).strict();
export const AttendanceSchema = z.object({
  userId: IdSchema,
  messId: IdSchema,
  date: DateSchema,
  mealType: MealTypeSchema,
  status: AttendanceStatusSchema,
  method: AttendanceMethodSchema.default("MANUAL")
}).strict();
export const AttendanceBatchSchema = z.object({
  messId: IdSchema,
  date: DateSchema,
  records: z.array(z.object({
    userId: IdSchema,
    mealType: MealTypeSchema,
    status: AttendanceStatusSchema
  }).strict()).min(1).max(500)
}).strict();
export const AttendanceQuerySchema = z.object({
  messId: IdSchema.optional(),
  date: DateSchema.optional()
}).strict();
export const QrAttendanceSchema = z.object({
  messId: IdSchema,
  date: DateSchema,
  mealType: MealTypeSchema,
  token: z.string().trim().min(20).max(200)
}).strict();
export const PaymentIdentifierSchema = z.object({
  provider: PaymentProviderSchema,
  providerPaymentId: z.string().trim().min(1).max(255).optional(),
  providerOrderId: z.string().trim().min(1).max(255).optional()
}).strict().refine((value) => value.provider === "CASH" || value.providerPaymentId || value.providerOrderId,
  "A provider payment or order identifier is required");
export const PaymentInitiationSchema = z.object({ subscriptionId: IdSchema }).strict();
export const PaymentVerificationSchema = z.object({
  providerPaymentId: z.string().trim().min(1).max(255),
  providerOrderId: z.string().trim().min(1).max(255),
  signature: z.string().trim().min(1).max(255)
}).strict();
export const PaymentParamsSchema = z.object({ paymentId: IdSchema }).strict();
export const PaymentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"]).optional()
}).strict();
export const PaymentWebhookSchema = z.object({
  eventId: z.string().trim().min(1).max(255),
  event: z.enum(["payment.captured", "payment.failed"]),
  payment: z.object({
    id: z.string().trim().min(1).max(255),
    orderId: z.string().trim().min(1).max(255).optional(),
    status: z.enum(["captured", "failed"]),
    amount: z.number().int().nonnegative().optional()
  }).strict()
}).strict();
export const SubscriptionParamsSchema = z.object({ subscriptionId: IdSchema }).strict();

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.string().trim().max(50).optional(),
  from: DateSchema.optional(),
  to: DateSchema.optional()
}).strict().refine((value) => !value.from || !value.to || value.from <= value.to, "from must be before to");
export const BookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  date: DateSchema.optional(),
  status: z.string().trim().max(50).optional()
}).strict();
export const ExtraMealSchema = z.object({ messId: IdSchema, date: DateSchema, mealType: MealTypeSchema }).strict();
export const QrTokenSchema = z.object({ token: z.string().trim().min(20).max(200) }).strict();

export const VerifyPhoneSchema = z.object({ code: z.string().trim().regex(/^\d{4,8}$/, "Verification code must be numeric") }).strict();

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
