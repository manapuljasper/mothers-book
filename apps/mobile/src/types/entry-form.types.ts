/**
 * Entry Form Types
 *
 * Types used for the add/edit entry form with pending medications and lab requests.
 */

import type { MedicationFrequency } from "./medication.types";

// Lab priority type
export type LabPriority = "routine" | "urgent" | "stat";

export const LAB_PRIORITY_LABELS: Record<LabPriority, string> = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "STAT",
};

// Pending medication (not yet saved to DB)
export interface PendingMedication {
  id: string; // Local ID for list management
  name: string;
  dosageAmount: string;
  dosageUnit: string;
  instructions: string;
  frequencyPerDay: MedicationFrequency;
  endDate?: Date;
  // Tracking
  isExisting?: boolean; // True if editing an existing medication
  existingId?: string; // DB ID if editing
  fromFavorite?: boolean; // True if added from favorites
}

// Pending lab request (not yet saved to DB)
export interface PendingLabRequest {
  id: string; // Local ID for list management
  name: string;
  notes?: string;
  priority: LabPriority;
  dueDate?: Date;
  // Tracking
  isExisting?: boolean; // True if editing an existing lab
  existingId?: string; // DB ID if editing
  fromFavorite?: boolean; // True if added from favorites
}

// Form data for creating/updating entry with items
export interface EntryFormData {
  entryDate: Date;
  vitals: {
    bloodPressure?: string;
    weight?: string;
    fetalHeartRate?: string;
    aog?: string;
  };
  notes: string;
  instructions: string;
  followUpDate?: Date;
  medications: PendingMedication[];
  labRequests: PendingLabRequest[];
}

// Doctor favorite item (from DB)
export interface DoctorFavorite {
  id: string;
  doctorId: string;
  itemType: "medication" | "lab";
  name: string;
  genericName?: string;
  // Medication defaults
  defaultDosage?: number;
  defaultDosageUnit?: string;
  defaultFrequency?: number;
  defaultInstructions?: string;
  // Lab defaults
  labCode?: string;
  defaultPriority?: LabPriority;
  // Tracking
  usageCount: number;
  lastUsedAt: Date;
  hasCustomDefaults: boolean;
}
