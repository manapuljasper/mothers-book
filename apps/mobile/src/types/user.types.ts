export type UserRole = 'doctor' | 'mother';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  createdAt: Date;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  prcNumber: string;
  clinicName: string;
  clinicAddress: string;
  contactNumber: string;
  specialization?: string;
  avatarUrl?: string;
  clinicSchedule?: string;
  latitude?: number;
  longitude?: number;
  fullName?: string; // Optional - for API/store responses that include it
}

export interface MotherProfile {
  id: string;
  userId: string;
  birthdate: Date;
  contactNumber?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  avatarUrl?: string;
  babyName?: string;
  fullName?: string; // Optional - for API/store responses that include it
}
