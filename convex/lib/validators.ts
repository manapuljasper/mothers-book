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
  v.literal("mother"),
  v.literal("super_admin")
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

// Lab priority validator
export const labPriorityValidator = v.union(
  v.literal("routine"),
  v.literal("urgent"),
  v.literal("stat")
);

export type LabPriority = Infer<typeof labPriorityValidator>;

// Risk level validator
export const riskLevelValidator = v.union(
  v.literal("low"),
  v.literal("high")
);

export type RiskLevel = Infer<typeof riskLevelValidator>;

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "Low Risk",
  high: "High Risk",
};

export const LAB_PRIORITY_LABELS: Record<LabPriority, string> = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "STAT",
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

// Dosage units (stored as singular, pluralized on display)
export const dosageUnits = [
  "mg",
  "g",
  "mcg",
  "mL",
  "L",
  "IU",
  "unit",
  "tablet",
  "capsule",
  "drop",
] as const;

export type DosageUnit = (typeof dosageUnits)[number];

export const DOSAGE_UNIT_LABELS: Record<DosageUnit, string> = {
  mg: "mg (milligrams)",
  g: "g (grams)",
  mcg: "mcg (micrograms)",
  mL: "mL (milliliters)",
  L: "L (liters)",
  IU: "IU (international units)",
  unit: "unit",
  tablet: "tablet",
  capsule: "capsule",
  drop: "drop",
};

// Units that need pluralization (add 's' when amount > 1)
const PLURALIZABLE_UNITS: DosageUnit[] = ["unit", "tablet", "capsule", "drop"];

/**
 * Format dosage unit with proper pluralization
 * @param amount - The dosage amount (number or string)
 * @param unit - The dosage unit (singular form)
 * @returns Properly pluralized unit string
 */
export function formatDosageUnit(amount: number | string, unit: DosageUnit): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (PLURALIZABLE_UNITS.includes(unit) && numAmount !== 1) {
    return `${unit}s`;
  }
  return unit;
}

/**
 * Format complete dosage string (amount + unit)
 * @param amount - The dosage amount
 * @param unit - The dosage unit (singular form)
 * @returns Formatted string like "2 tablets" or "500 mg"
 */
export function formatDosage(amount: number | string, unit: DosageUnit): string {
  return `${amount} ${formatDosageUnit(amount, unit)}`;
}

// Medication category validator
export const medicationCategories = [
  "prenatal_vitamins",
  "iron_supplements",
  "calcium_supplements",
  "folic_acid",
  "antibiotics",
  "pain_relief",
  "anti_nausea",
  "blood_pressure",
  "hormones",
  "other",
] as const;

export const medicationCategoryValidator = v.union(
  v.literal("prenatal_vitamins"),
  v.literal("iron_supplements"),
  v.literal("calcium_supplements"),
  v.literal("folic_acid"),
  v.literal("antibiotics"),
  v.literal("pain_relief"),
  v.literal("anti_nausea"),
  v.literal("blood_pressure"),
  v.literal("hormones"),
  v.literal("other")
);

export type MedicationCategory = Infer<typeof medicationCategoryValidator>;

export const MEDICATION_CATEGORY_LABELS: Record<MedicationCategory, string> = {
  prenatal_vitamins: "Prenatal Vitamins",
  iron_supplements: "Iron Supplements",
  calcium_supplements: "Calcium Supplements",
  folic_acid: "Folic Acid",
  antibiotics: "Antibiotics",
  pain_relief: "Pain Relief",
  anti_nausea: "Anti-Nausea",
  blood_pressure: "Blood Pressure",
  hormones: "Hormones",
  other: "Other",
};

// Lab test category validator
export const labCategories = [
  "blood_tests",
  "urinalysis",
  "imaging",
  "prenatal_screening",
  "glucose_tests",
  "infection_screening",
  "genetic_tests",
  "other",
] as const;

export const labCategoryValidator = v.union(
  v.literal("blood_tests"),
  v.literal("urinalysis"),
  v.literal("imaging"),
  v.literal("prenatal_screening"),
  v.literal("glucose_tests"),
  v.literal("infection_screening"),
  v.literal("genetic_tests"),
  v.literal("other")
);

export type LabCategory = Infer<typeof labCategoryValidator>;

export const LAB_CATEGORY_LABELS: Record<LabCategory, string> = {
  blood_tests: "Blood Tests",
  urinalysis: "Urinalysis",
  imaging: "Imaging",
  prenatal_screening: "Prenatal Screening",
  glucose_tests: "Glucose Tests",
  infection_screening: "Infection Screening",
  genetic_tests: "Genetic Tests",
  other: "Other",
};

// Super admin permissions
export const ADMIN_PERMISSIONS = [
  "users:read",
  "users:write",
  "catalog:read",
  "catalog:write",
  "analytics:read",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];
