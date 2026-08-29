import { z } from "zod";

export const UserRoleSchema = z.enum(["USER", "OWNER", "ADMIN"]);
export const UserTypeSchema = z.enum(["STUDENT", "PROFESSIONAL"]);
export const AccountStatusSchema = z.enum(["ACTIVE", "DISABLED"]);

export const PhoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number");

export const EmailSchema = z.string().trim().email("Invalid email format").optional().or(z.literal(""));

export const RegisterUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: PhoneSchema,
  email: EmailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: UserRoleSchema.default("USER"),
  userType: UserTypeSchema.default("STUDENT")
});

export const LoginUserSchema = z.object({
  phone: PhoneSchema,
  password: z.string().min(1, "Password is required")
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
