/**
 * React Query Hooks Exports
 *
 * Central export point for all React Query hooks organized by feature.
 */

// Auth hooks
export { useSignIn, useSignUp, useSignOut, useInitializeAuth } from './auth';

// Booklet hooks
export {
  bookletKeys,
  useBookletById,
  useBookletsByMother,
  useBookletsByDoctor,
  useBookletDoctors,
  useCreateBooklet,
  useUpdateBooklet,
  useGrantDoctorAccess,
  useRevokeDoctorAccess,
} from './booklet';

// Medical hooks
export {
  medicalKeys,
  useEntriesByBooklet,
  useEntryById,
  useCreateEntry,
  useUpdateEntry,
  useLabsByBooklet,
  useLabsByEntry,
  usePendingLabs,
  useCreateLabRequest,
  useUpdateLabStatus,
  useDeleteLabRequest,
} from './medical';

// Medication hooks
export {
  medicationKeys,
  useMedicationsByBooklet,
  useMedicationsByEntry,
  useActiveMedications,
  useTodayMedications,
  useMedicationById,
  useMedicationAdherence,
  useCreateMedication,
  useUpdateMedication,
  useDeactivateMedication,
  useDeleteMedication,
  useLogIntake,
} from './medication';

// Doctor hooks
export {
  doctorKeys,
  useAllDoctors,
  useDoctorById,
  useSearchDoctors,
} from './doctors';

// Profile hooks
export {
  profileKeys,
  useUpdateDoctorProfile,
  useUpdateMotherProfile,
} from './profile';
