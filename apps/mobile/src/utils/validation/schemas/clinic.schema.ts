import { z } from "zod";
import {
  requiredString,
  optionalPhilippinePhone,
  googleMapsLink,
} from "../helpers";

/**
 * Clinic form schema
 */
export const clinicSchema = z.object({
  name: requiredString("Clinic name"),
  address: requiredString("Clinic address"),
  contactNumber: optionalPhilippinePhone,
  googleMapsLink: googleMapsLink.optional().or(z.literal("")),
});

export type ClinicFormData = z.infer<typeof clinicSchema>;
