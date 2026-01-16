/**
 * Offline Hooks
 *
 * Hooks for offline-first data management with Convex.
 */

export { useOfflineQuery } from './useOfflineQuery';
export type { UseOfflineQueryOptions, UseOfflineQueryResult } from './useOfflineQuery';

export { useOfflineMutation } from './useOfflineMutation';
export type { UseOfflineMutationOptions, UseOfflineMutationResult } from './useOfflineMutation';

export { useSyncProcessor } from './useSyncProcessor';
export { useNetworkListener } from './useNetworkListener';

// Pre-configured offline hook wrappers
export {
  // Booklet hooks
  useBookletsByMotherOffline,
  useBookletsByDoctorOffline,
  useCreateBookletOffline,
  // Medical entry hooks
  useEntriesByBookletOffline,
  useCreateEntryOffline,
  useUpdateEntryOffline,
  // Lab request hooks
  useLabsByBookletOffline,
  useCreateLabOffline,
  useUpdateLabStatusOffline,
  // Medication hooks
  useMedicationsByBookletOffline,
  useActiveMedicationsOffline,
  useCreateMedicationOffline,
  useUpdateMedicationOffline,
  useLogIntakeOffline,
  // Doctor hooks
  useAllDoctorsOffline,
} from './wrappers';
