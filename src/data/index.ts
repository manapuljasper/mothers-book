import { StorageService, StorageKey } from '../services/storage.service';
import type {
  User,
  DoctorProfile,
  MotherProfile,
  MotherBooklet,
  BookletAccess,
  MedicalEntry,
  LabRequest,
  Medication,
  MedicationIntakeLog,
} from '../types';

import { sampleUsers } from './users.data';
import { sampleDoctorProfiles } from './doctors.data';
import { sampleMotherProfiles } from './mothers.data';
import { sampleBooklets, sampleBookletAccess } from './booklets.data';
import { sampleMedicalEntries, sampleLabRequests } from './medical-entries.data';
import { sampleMedications, sampleMedicationIntakeLogs } from './medications.data';

// Re-export all sample data
export { sampleUsers } from './users.data';
export { sampleDoctorProfiles } from './doctors.data';
export { sampleMotherProfiles } from './mothers.data';
export { sampleBooklets, sampleBookletAccess } from './booklets.data';
export { sampleMedicalEntries, sampleLabRequests } from './medical-entries.data';
export { sampleMedications, sampleMedicationIntakeLogs } from './medications.data';

// Initialize sample data in storage
export function initializeSampleData(): void {
  // Check if data is already initialized
  if (StorageService.has(StorageKey.DATA_INITIALIZED)) {
    console.log('Sample data already initialized');
    return;
  }

  console.log('Initializing sample data...');

  // Store all sample data
  StorageService.set<User[]>(StorageKey.USERS, sampleUsers);
  StorageService.set<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES, sampleDoctorProfiles);
  StorageService.set<MotherProfile[]>(StorageKey.MOTHER_PROFILES, sampleMotherProfiles);
  StorageService.set<MotherBooklet[]>(StorageKey.BOOKLETS, sampleBooklets);
  StorageService.set<BookletAccess[]>(StorageKey.BOOKLET_ACCESS, sampleBookletAccess);
  StorageService.set<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES, sampleMedicalEntries);
  StorageService.set<LabRequest[]>(StorageKey.LAB_REQUESTS, sampleLabRequests);
  StorageService.set<Medication[]>(StorageKey.MEDICATIONS, sampleMedications);
  StorageService.set<MedicationIntakeLog[]>(StorageKey.INTAKE_LOGS, sampleMedicationIntakeLogs);

  // Mark as initialized
  StorageService.set(StorageKey.DATA_INITIALIZED, true);

  console.log('Sample data initialized successfully');
}

// Reset to default sample data (useful for testing/development)
export function resetSampleData(): void {
  console.log('Resetting to sample data...');

  // Clear all data
  StorageService.clearAll();

  // Re-initialize
  StorageService.set<User[]>(StorageKey.USERS, sampleUsers);
  StorageService.set<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES, sampleDoctorProfiles);
  StorageService.set<MotherProfile[]>(StorageKey.MOTHER_PROFILES, sampleMotherProfiles);
  StorageService.set<MotherBooklet[]>(StorageKey.BOOKLETS, sampleBooklets);
  StorageService.set<BookletAccess[]>(StorageKey.BOOKLET_ACCESS, sampleBookletAccess);
  StorageService.set<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES, sampleMedicalEntries);
  StorageService.set<LabRequest[]>(StorageKey.LAB_REQUESTS, sampleLabRequests);
  StorageService.set<Medication[]>(StorageKey.MEDICATIONS, sampleMedications);
  StorageService.set<MedicationIntakeLog[]>(StorageKey.INTAKE_LOGS, sampleMedicationIntakeLogs);
  StorageService.set(StorageKey.DATA_INITIALIZED, true);

  console.log('Sample data reset successfully');
}

// Get all data from storage (for debugging)
export function getAllStoredData() {
  return {
    users: StorageService.get<User[]>(StorageKey.USERS),
    doctorProfiles: StorageService.get<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES),
    motherProfiles: StorageService.get<MotherProfile[]>(StorageKey.MOTHER_PROFILES),
    booklets: StorageService.get<MotherBooklet[]>(StorageKey.BOOKLETS),
    bookletAccess: StorageService.get<BookletAccess[]>(StorageKey.BOOKLET_ACCESS),
    medicalEntries: StorageService.get<MedicalEntry[]>(StorageKey.MEDICAL_ENTRIES),
    labRequests: StorageService.get<LabRequest[]>(StorageKey.LAB_REQUESTS),
    medications: StorageService.get<Medication[]>(StorageKey.MEDICATIONS),
    intakeLogs: StorageService.get<MedicationIntakeLog[]>(StorageKey.INTAKE_LOGS),
  };
}
