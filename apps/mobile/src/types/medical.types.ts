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
export type LabPriorityType = 'routine' | 'urgent' | 'stat';

export interface Vitals {
  bloodPressure?: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  fetalHeartRate?: number;
  fundalHeight?: number;
  aog?: string; // Age of Gestation e.g., "20 weeks 3 days"
}

export type RiskLevel = 'low' | 'high';

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
  riskLevel?: RiskLevel;
  followUpDate?: Date;
  attachments?: string[]; // Array of image URIs
  createdAt: Date;
  updatedAt?: Date;
}

export interface LabRequest {
  id: string;
  bookletId: string;
  medicalEntryId?: string; // Optional - for historical context
  requestedByDoctorId?: string; // Doctor who requested the lab
  description: string;
  status: LabStatus;
  priority?: LabPriorityType; // Routine, Urgent, or STAT
  dueDate?: Date; // When results are needed
  requestedDate: Date;
  completedDate?: Date;
  results?: string;
  notes?: string;
  // Lab result attachments
  attachments?: string[]; // Convex storage IDs
  uploadedByMotherId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LabRequestWithDoctor extends LabRequest {
  doctorName?: string;
  doctorSpecialty?: string;
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
