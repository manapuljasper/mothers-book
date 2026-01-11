import { v, Infer } from "convex/values";

// Vitals validator (reused in medical entries)
export const vitalsValidator = v.object({
  bloodPressure: v.optional(v.string()),
  weight: v.optional(v.number()),
  temperature: v.optional(v.number()),
  heartRate: v.optional(v.number()),
  fetalHeartRate: v.optional(v.number()),
  fundalHeight: v.optional(v.number()),
  aog: v.optional(v.string()),
});

export type Vitals = Infer<typeof vitalsValidator>;

// Entry type validator
export const entryTypeValidator = v.union(
  v.literal("prenatal_checkup"),
  v.literal("postnatal_checkup"),
  v.literal("ultrasound"),
  v.literal("lab_review"),
  v.literal("consultation"),
  v.literal("emergency"),
  v.literal("delivery"),
  v.literal("other")
);

export type EntryType = Infer<typeof entryTypeValidator>;

// Lab status validator
export const labStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("cancelled")
);

export type LabStatus = Infer<typeof labStatusValidator>;

// Booklet status validator
export const bookletStatusValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
  v.literal("completed")
);

export type BookletStatus = Infer<typeof bookletStatusValidator>;

// User role validator
export const userRoleValidator = v.union(
  v.literal("doctor"),
  v.literal("mother")
);

export type UserRole = Infer<typeof userRoleValidator>;

// Medication frequency validator
export const medicationFrequencyValidator = v.union(
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(4)
);

export type MedicationFrequency = Infer<typeof medicationFrequencyValidator>;

// Intake status validator
export const intakeStatusValidator = v.union(
  v.literal("taken"),
  v.literal("missed"),
  v.literal("skipped")
);

export type IntakeStatus = Infer<typeof intakeStatusValidator>;

// Labels (same as before, for UI)
export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  prenatal_checkup: "Prenatal Checkup",
  postnatal_checkup: "Postnatal Checkup",
  ultrasound: "Ultrasound",
  lab_review: "Lab Review",
  consultation: "Consultation",
  emergency: "Emergency",
  delivery: "Delivery",
  other: "Other",
};

export const LAB_STATUS_LABELS: Record<LabStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  1: "Once daily",
  2: "Twice daily",
  3: "Three times daily",
  4: "Four times daily",
};

export const INTAKE_STATUS_LABELS: Record<IntakeStatus, string> = {
  taken: "Taken",
  missed: "Missed",
  skipped: "Skipped",
};

export const DEFAULT_TIMES_BY_FREQUENCY: Record<MedicationFrequency, string[]> = {
  1: ["08:00"],
  2: ["08:00", "20:00"],
  3: ["08:00", "14:00", "20:00"],
  4: ["08:00", "12:00", "18:00", "22:00"],
};

// QR token expiry in minutes
export const QR_EXPIRY_MINUTES = 10;
