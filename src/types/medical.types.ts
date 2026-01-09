export type EntryType =
  | 'prenatal_checkup'
  | 'postnatal_checkup'
  | 'ultrasound'
  | 'lab_review'
  | 'consultation'
  | 'emergency'
  | 'delivery'
  | 'other';

export type LabStatus = 'pending' | 'completed' | 'cancelled';

export interface Vitals {
  bloodPressure?: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  fetalHeartRate?: number;
  fundalHeight?: number;
  aog?: string; // Age of Gestation e.g., "20 weeks 3 days"
}

export interface MedicalEntry {
  id: string;
  bookletId: string;
  doctorId: string;
  entryType: EntryType;
  visitDate: Date;
  notes: string;
  vitals?: Vitals;
  diagnosis?: string;
  recommendations?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LabRequest {
  id: string;
  medicalEntryId: string;
  bookletId: string;
  description: string;
  status: LabStatus;
  requestedDate: Date;
  completedDate?: Date;
  results?: string;
  notes?: string;
}

export interface MedicalEntryWithDoctor extends MedicalEntry {
  doctorName: string;
  doctorSpecialization?: string;
}

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  prenatal_checkup: 'Prenatal Checkup',
  postnatal_checkup: 'Postnatal Checkup',
  ultrasound: 'Ultrasound',
  lab_review: 'Lab Review',
  consultation: 'Consultation',
  emergency: 'Emergency',
  delivery: 'Delivery',
  other: 'Other',
};

export const LAB_STATUS_LABELS: Record<LabStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
