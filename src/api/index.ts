/**
 * API Module Exports
 *
 * Central export point for all API functions.
 * When transitioning to a real backend, only the implementations
 * in individual API files need to change - consumers remain unchanged.
 */

// Client utilities
export { supabase, ApiError, handleSupabaseError, toCamelCase, toSnakeCase } from './client';
export type { ApiResponse, PaginatedResponse } from './client';

// Booklet APIs
export {
  getBookletById,
  getBookletsByMother,
  getBookletsByDoctor,
  createBooklet,
  updateBooklet,
  grantDoctorAccess,
  revokeDoctorAccess,
  getBookletDoctors,
} from './booklets.api';

// Medical APIs
export {
  getEntriesByBooklet,
  getEntryById,
  createEntry,
  updateEntry,
  getLabsByBooklet,
  getLabsByEntry,
  getPendingLabs,
  createLabRequest,
  updateLabStatus,
} from './medical.api';

// Medication APIs
export {
  getMedicationsByBooklet,
  getActiveMedications,
  getTodayMedications,
  getMedicationById,
  getMedicationsByEntry,
  createMedication,
  updateMedication,
  deactivateMedication,
  logIntake,
  getMedicationAdherence,
} from './medications.api';

// Doctor APIs
export {
  getAllDoctors,
  getDoctorById,
  searchDoctors,
} from './doctors.api';
