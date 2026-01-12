/**
 * Clinic Convex Hooks
 *
 * Query and mutation hooks for doctor clinics using Convex.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all clinics for a doctor
 */
export function useClinicsByDoctor(doctorId: string | null | undefined) {
  return useQuery(
    api.clinics.getByDoctor,
    doctorId ? { doctorId: doctorId as Id<"doctorProfiles"> } : "skip"
  );
}

/**
 * Get primary clinic for a doctor
 */
export function usePrimaryClinic(doctorId: string | null | undefined) {
  return useQuery(
    api.clinics.getPrimaryByDoctor,
    doctorId ? { doctorId: doctorId as Id<"doctorProfiles"> } : "skip"
  );
}

/**
 * Get a single clinic by ID
 */
export function useClinic(clinicId: string | null | undefined) {
  return useQuery(
    api.clinics.getById,
    clinicId ? { clinicId: clinicId as Id<"doctorClinics"> } : "skip"
  );
}

// ============================================================================
// MUTATIONS
// ============================================================================

export interface ScheduleItem {
  days: string;
  startTime: string;
  endTime: string;
}

/**
 * Create a new clinic
 */
export function useCreateClinic() {
  const mutation = useMutation(api.clinics.create);

  return async (args: {
    doctorId: string;
    name: string;
    address: string;
    contactNumber?: string;
    googleMapsLink?: string;
    latitude?: number;
    longitude?: number;
    schedule?: ScheduleItem[];
    isPrimary?: boolean;
  }) => {
    return await mutation({
      ...args,
      doctorId: args.doctorId as Id<"doctorProfiles">,
    });
  };
}

/**
 * Update an existing clinic
 */
export function useUpdateClinic() {
  const mutation = useMutation(api.clinics.update);

  return async (args: {
    clinicId: string;
    name?: string;
    address?: string;
    contactNumber?: string;
    googleMapsLink?: string;
    latitude?: number;
    longitude?: number;
    schedule?: ScheduleItem[];
    isPrimary?: boolean;
  }) => {
    return await mutation({
      ...args,
      clinicId: args.clinicId as Id<"doctorClinics">,
    });
  };
}

/**
 * Delete a clinic
 */
export function useDeleteClinic() {
  const mutation = useMutation(api.clinics.remove);

  return async (clinicId: string) => {
    return await mutation({ clinicId: clinicId as Id<"doctorClinics"> });
  };
}

/**
 * Set a clinic as primary
 */
export function useSetPrimaryClinic() {
  const mutation = useMutation(api.clinics.setPrimary);

  return async (clinicId: string) => {
    return await mutation({ clinicId: clinicId as Id<"doctorClinics"> });
  };
}
