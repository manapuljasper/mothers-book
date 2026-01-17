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
  usePendingLabsByDoctor,
  useCreateLabRequest,
  useUpdateLabStatus,
  useDeleteLabRequest,
  useEntriesByDoctorToday,
  useCreateEntryWithItems,
  useUpdateEntryWithItems,
} from "./medical";
export type { EntryWithPatientDetails } from "./medical";

// Favorites hooks
export {
  useMedicationFavorites,
  useLabFavorites,
  useAllFavorites,
  useAddToFavorites,
  useIncrementFavoriteUsage,
  useIncrementUsageByName,
  useSaveWithCustomDefaults,
  useRemoveFromFavorites,
} from "./favorites";

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

// Catalog hooks (medication and lab libraries)
export {
  useMedicationCatalog,
  useSearchMedicationCatalog,
  useMedicationCatalogItem,
  useMedicationCategories,
  useLabCatalog,
  useSearchLabCatalog,
  useLabCatalogItem,
  useLabCategories,
} from "./catalog";

// Responsive hooks
export { useResponsive, type ResponsiveValues, type DeviceType } from "./useResponsive";
