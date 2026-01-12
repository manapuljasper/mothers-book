/**
 * Convex Hooks Exports
 *
 * Central export point for all Convex hooks organized by feature.
 */

// Auth hooks
export {
  useCurrentUser,
  useSignIn,
  useSignUp,
  useSignOut,
} from "./auth";

// Booklet hooks
export {
  useBookletById,
  useBookletByIdWithMother,
  useBookletsByMother,
  useBookletsByDoctor,
  useBookletDoctors,
  useCreateBooklet,
  useUpdateBooklet,
  useGrantDoctorAccess,
  useRevokeDoctorAccess,
} from "./booklet";

// Medical hooks
export {
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
} from "./medical";

// Medication hooks
export {
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
} from "./medication";

// Doctor hooks
export { useAllDoctors, useDoctorById, useSearchDoctors } from "./doctors";

// Profile hooks
export { useUpdateDoctorProfile, useUpdateMotherProfile } from "./profile";

// Clinic hooks
export {
  useClinicsByDoctor,
  usePrimaryClinic,
  useClinic,
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
  useSetPrimaryClinic,
} from "./clinics";
