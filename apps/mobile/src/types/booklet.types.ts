import { DoctorProfile } from './user.types';

export type BookletStatus = 'active' | 'archived' | 'completed';
export type RiskLevel = 'low' | 'high';

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

export interface BookletWithMother extends MotherBooklet {
  motherName: string;
  lastVisitDate?: Date;
  nextAppointment?: Date;
  hasEntries?: boolean;
}
