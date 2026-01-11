/**
 * Doctors Convex Hooks
 *
 * Query hooks for doctor profile operations using Convex.
 */

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Get all doctors
 */
export function useAllDoctors() {
  return useQuery(api.doctors.listAll, {});
}

/**
 * Get a doctor by ID
 */
export function useDoctorById(id: Id<"doctorProfiles"> | undefined) {
  return useQuery(api.doctors.getById, id ? { id } : "skip");
}

/**
 * Search doctors by query
 */
export function useSearchDoctors(query: string) {
  return useQuery(
    api.doctors.search,
    query.length > 0 ? { query } : "skip"
  );
}
