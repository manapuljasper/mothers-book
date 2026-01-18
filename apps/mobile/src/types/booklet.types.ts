import { DoctorProfile } from './user.types';

export type BookletStatus = 'active' | 'archived' | 'completed';
export type RiskLevel = 'low' | 'high';

// Medical history entry for past conditions
export interface MedicalHistoryItem {
  condition: string; // e.g., "Hypertension", "Diabetes"
  notes?: string;
  diagnosedYear?: number;
}

export interface MotherBooklet {
  id: string;
  motherId: string;
  label: string;
  status: BookletStatus;
  createdAt: Date;
  lastMenstrualPeriod?: Date;
  expectedDueDate?: Date;
  actualDeliveryDate?: Date;
  currentRiskLevel?: RiskLevel;
  notes?: string;
  // Allergies & Medical History
  allergies?: string[]; // e.g., ["Penicillin", "Sulfa drugs"]
  medicalHistory?: MedicalHistoryItem[];
}

export interface BookletAccess {
  id: string;
  bookletId: string;
  doctorId: string;
  grantedAt: Date;
  revokedAt?: Date | null;
}

export interface BookletWithAccess extends MotherBooklet {
  accessRecords: BookletAccess[];
  doctors: DoctorProfile[];
}

// Vitals type for summary display
interface VitalsSummary {
  bloodPressure?: string;
  weight?: number;
  fetalHeartRate?: number;
  aog?: string;
}

export interface BookletWithMother extends MotherBooklet {
  motherName: string;
  motherBirthdate?: number; // Unix timestamp for age calculation
  lastVisitDate?: Date;
  nextAppointment?: Date;
  hasEntries?: boolean;
  // Entry summary data (for patient list cards)
  latestVitals?: VitalsSummary;
  activeMedicationCount?: number;
  pendingLabCount?: number;
  hasAllergies?: boolean;
  // Doctor's internal patient ID for this booklet
  patientId?: string;
}
