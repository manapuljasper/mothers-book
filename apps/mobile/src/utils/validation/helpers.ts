import { z } from "zod";

/**
 * Common validation schemas and helpers for form validation
 */

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const requiredString = (field: string) =>
  z.string().min(1, `${field} is required`);

/**
 * Philippine phone number validation
 * Accepts formats: +639XXXXXXXXX or 09XXXXXXXXX
 * Empty string is allowed (optional field)
 */
export const philippinePhone = z
  .string()
  .regex(/^(\+63|0)9\d{9}$/, "Invalid phone number (e.g., 09171234567)")
  .or(z.literal(""));

/**
 * Optional Philippine phone - more lenient for optional fields
 */
export const optionalPhilippinePhone = z
  .string()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      return /^(\+63|0)9\d{9}$/.test(val);
    },
    { message: "Invalid phone number (e.g., 09171234567)" }
  )
  .optional()
  .or(z.literal(""));

/**
 * Google Maps link validation
 */
export const googleMapsLink = z
  .string()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      return (
        val.includes("google.com/maps") ||
        val.includes("maps.google.com") ||
        val.includes("goo.gl/maps") ||
        val.includes("maps.app.goo.gl")
      );
    },
    {
      message:
        "Please provide a valid Google Maps link. Open Google Maps, search for your clinic, tap Share, and copy the link.",
    }
  );

/**
 * PRC License Number validation
 */
export const prcNumber = z
  .string()
  .min(1, "PRC License Number is required")
  .regex(/^\d{7}$/, "PRC License Number must be 7 digits");

/**
 * Optional string that transforms empty to undefined
 */
export const optionalString = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : val.trim()))
  .optional();
