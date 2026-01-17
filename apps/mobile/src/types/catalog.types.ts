/**
 * Catalog Types
 *
 * Types for medication and lab test catalogs (libraries).
 */

// Dosage units
export type DosageUnit =
  | "mg"
  | "g"
  | "mcg"
  | "mL"
  | "L"
  | "IU"
  | "units"
  | "tablets"
  | "capsules"
  | "drops";

// Medication categories
export type MedicationCategory =
  | "prenatal_vitamins"
  | "iron_supplements"
  | "calcium_supplements"
  | "folic_acid"
  | "antibiotics"
  | "pain_relief"
  | "anti_nausea"
  | "blood_pressure"
  | "hormones"
  | "other";

// Lab test categories
export type LabCategory =
  | "blood_tests"
  | "urinalysis"
  | "imaging"
  | "prenatal_screening"
  | "glucose_tests"
  | "infection_screening"
  | "genetic_tests"
  | "other";

// Medication catalog item
export interface MedicationCatalogItem {
  id: string;
  name: string;
  genericName: string;
  category: MedicationCategory;
  dosage?: number;
  dosageUnit?: DosageUnit;
  availableUnits?: string[];
  availableDosages?: number[];
  instructions?: string;
  warnings?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Lab test catalog item
export interface LabCatalogItem {
  id: string;
  name: string;
  code?: string;
  category: LabCategory;
  description?: string;
  normalRange?: string;
  units?: string;
  preparation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Category with count (for filtering UI)
export interface CategoryWithCount {
  category: string;
  count: number;
}

// Labels for categories
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

export const DOSAGE_UNIT_LABELS: Record<DosageUnit, string> = {
  mg: "mg",
  g: "g",
  mcg: "mcg",
  mL: "mL",
  L: "L",
  IU: "IU",
  units: "units",
  tablets: "tablets",
  capsules: "capsules",
  drops: "drops",
};

// All available dosage units for selection
export const DOSAGE_UNITS: DosageUnit[] = [
  "mg",
  "g",
  "mcg",
  "mL",
  "L",
  "IU",
  "units",
  "tablets",
  "capsules",
  "drops",
];
