import { z } from "zod";
import {
  requiredString,
  optionalPhilippinePhone,
  optionalString,
} from "../helpers";

/**
 * Mother profile form schema
 */
export const motherProfileSchema = z.object({
  fullName: requiredString("Full name"),
  birthdate: z.date(),
  contactNumber: optionalPhilippinePhone,
  address: optionalString,
  emergencyContactName: optionalString,
  emergencyContact: optionalPhilippinePhone,
  babyName: optionalString,
});

export type MotherProfileFormData = z.infer<typeof motherProfileSchema>;

/**
 * Doctor profile form schema
 */
export const doctorProfileSchema = z.object({
  fullName: requiredString("Full name"),
  specialization: optionalString,
  prcNumber: requiredString("PRC License Number"),
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .refine(
      (val) => {
        if (!val || val.trim() === "") return false;
        // Allow various formats - more lenient than strict Philippine format
        return val.replace(/\D/g, "").length >= 10;
      },
      { message: "Please enter a valid contact number" }
    ),
});

export type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;
