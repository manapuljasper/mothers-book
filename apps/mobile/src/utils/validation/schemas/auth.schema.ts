import { z } from "zod";
import { emailSchema, passwordSchema, requiredString } from "../helpers";

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Verification code schema (for 2FA)
 */
export const verificationCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Verification code must be 6 digits"),
});

export type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>;

/**
 * Signup form schema
 */
export const signupSchema = z
  .object({
    role: z
      .enum(["doctor", "mother"], { message: "Please select your role" })
      .optional()
      .refine((val): val is "doctor" | "mother" => val !== undefined, {
        message: "Please select your role",
      }),
    firstName: requiredString("First name"),
    lastName: requiredString("Last name"),
    email: emailSchema,
    password: passwordSchema,
    birthdate: z.date().nullable(),
  })
  .refine((data) => data.role !== "mother" || data.birthdate !== null, {
    message: "Date of birth is required",
    path: ["birthdate"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
