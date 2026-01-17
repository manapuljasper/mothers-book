/**
 * Offline-Aware Hook Wrappers
 *
 * Pre-configured offline hooks for common queries and mutations.
 * These wrap the existing Convex hooks with caching and offline queue support.
 */

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useOfflineQuery } from './useOfflineQuery';
import { useOfflineMutation } from './useOfflineMutation';

// ========== Booklet Hooks ==========

/**
 * Get booklets by mother with offline caching.
 */
export function useBookletsByMotherOffline(motherId: Id<'motherProfiles'> | undefined) {
  return useOfflineQuery(
    api.booklets.listByMother,
    motherId ? { motherId } : 'skip',
    {
      cacheKey: motherId ? `booklets.byMother.${motherId}` : undefined,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Get booklets by doctor with offline caching.
 */
export function useBookletsByDoctorOffline(doctorId: Id<'doctorProfiles'> | undefined) {
  return useOfflineQuery(
    api.booklets.listByDoctor,
    doctorId ? { doctorId } : 'skip',
    {
      cacheKey: doctorId ? `booklets.byDoctor.${doctorId}` : undefined,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Create a new booklet with offline queue support.
 */
export function useCreateBookletOffline() {
  return useOfflineMutation(api.booklets.create, {
    tableName: 'booklets',
    operation: 'create',
  });
}

// ========== Medical Entry Hooks ==========

/**
 * Get medical entries by booklet with offline caching.
 */
export function useEntriesByBookletOffline(bookletId: Id<'booklets'> | undefined) {
  return useOfflineQuery(
    api.medical.listEntriesByBooklet,
    bookletId ? { bookletId } : 'skip',
    {
      cacheKey: bookletId ? `entries.byBooklet.${bookletId}` : undefined,
      staleTime: 5 * 60 * 1000,
    }
  );
}

/**
 * Create a medical entry with offline queue support.
 */
export function useCreateEntryOffline() {
  return useOfflineMutation(api.medical.createEntry, {
    tableName: 'medicalEntries',
    operation: 'create',
  });
}

/**
 * Update a medical entry with offline queue support.
 */
export function useUpdateEntryOffline() {
  return useOfflineMutation(api.medical.updateEntry, {
    tableName: 'medicalEntries',
    operation: 'update',
    getEntityId: (args) => args.id as string,
  });
}

// ========== Lab Request Hooks ==========

/**
 * Get lab requests by booklet with offline caching.
 */
export function useLabsByBookletOffline(bookletId: Id<'booklets'> | undefined) {
  return useOfflineQuery(
    api.medical.listLabsByBooklet,
    bookletId ? { bookletId } : 'skip',
    {
      cacheKey: bookletId ? `labs.byBooklet.${bookletId}` : undefined,
      staleTime: 5 * 60 * 1000,
    }
  );
}

/**
 * Create a lab request with offline queue support.
 */
export function useCreateLabOffline() {
  return useOfflineMutation(api.medical.createLab, {
    tableName: 'labRequests',
    operation: 'create',
  });
}

/**
 * Update lab status with offline queue support.
 */
export function useUpdateLabStatusOffline() {
  return useOfflineMutation(api.medical.updateLabStatus, {
    tableName: 'labRequests',
    operation: 'update',
    getEntityId: (args) => args.id as string,
  });
}

// ========== Medication Hooks ==========

/**
 * Get medications by booklet with offline caching.
 */
export function useMedicationsByBookletOffline(bookletId: Id<'booklets'> | undefined) {
  return useOfflineQuery(
    api.medications.listByBooklet,
    bookletId ? { bookletId } : 'skip',
    {
      cacheKey: bookletId ? `medications.byBooklet.${bookletId}` : undefined,
      staleTime: 2 * 60 * 1000, // 2 minutes for medications (more critical)
    }
  );
}

/**
 * Get active medications with offline caching.
 */
export function useActiveMedicationsOffline() {
  return useOfflineQuery(api.medications.listActive, {}, {
    cacheKey: 'medications.active',
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create a medication with offline queue support.
 */
export function useCreateMedicationOffline() {
  return useOfflineMutation(api.medications.create, {
    tableName: 'medications',
    operation: 'create',
  });
}

/**
 * Update a medication with offline queue support.
 */
export function useUpdateMedicationOffline() {
  return useOfflineMutation(api.medications.update, {
    tableName: 'medications',
    operation: 'update',
    getEntityId: (args) => args.id as string,
  });
}

/**
 * Log medication intake with offline queue support.
 * This is critical for patient adherence tracking.
 */
export function useLogIntakeOffline() {
  return useOfflineMutation(api.medications.logIntake, {
    tableName: 'medicationIntakeLogs',
    operation: 'create',
  });
}

// ========== Doctor Hooks ==========

/**
 * Get all doctors with offline caching.
 */
export function useAllDoctorsOffline() {
  return useOfflineQuery(api.doctors.listAll, {}, {
    cacheKey: 'doctors.all',
    staleTime: 10 * 60 * 1000, // 10 minutes (doctors list changes infrequently)
  });
}
