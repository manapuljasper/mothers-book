export type MedicationFrequency = 1 | 2 | 3 | 4;
export type IntakeStatus = 'taken' | 'missed' | 'skipped';

export interface Medication {
  id: string;
  medicalEntryId: string;
  name: string;
  dosage: string;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  frequencyPerDay: MedicationFrequency;
  timesOfDay?: string[]; // e.g., ["08:00", "20:00"]
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface MedicationIntakeLog {
  id: string;
  medicationId: string;
  scheduledDate: Date;
  doseIndex: number; // 0-indexed (0 = first dose of day)
  status: IntakeStatus;
  takenAt?: Date;
  recordedByUserId: string;
  notes?: string;
  createdAt: Date;
}

export interface MedicationWithLogs extends Medication {
  intakeLogs: MedicationIntakeLog[];
  todayLogs: MedicationIntakeLog[];
  adherenceRate: number; // 0-100 percentage
}

export const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  1: 'Once daily',
  2: 'Twice daily',
  3: 'Three times daily',
  4: 'Four times daily',
};

export const INTAKE_STATUS_LABELS: Record<IntakeStatus, string> = {
  taken: 'Taken',
  missed: 'Missed',
  skipped: 'Skipped',
};

export const DEFAULT_TIMES_BY_FREQUENCY: Record<MedicationFrequency, string[]> = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '18:00', '22:00'],
};
