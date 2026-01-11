/**
 * Doctors Convex Hooks
 *
 * Query hooks for doctor profile operations using Convex.
 */

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";

// Transform doctor profile document
function transformDoctor(doc: Doc<"doctorProfiles"> & { fullName: string }) {
  return {
    ...doc,
    id: doc._id as string,
  };
}

/**
 * Get all doctors
 */
export function useAllDoctors() {
  const result = useQuery(api.doctors.listAll, {});
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map(transformDoctor);
  }, [result]);
}

/**
 * Get a doctor by ID
 */
export function useDoctorById(id: string | undefined) {
  const result = useQuery(api.doctors.getById, id ? { id: id as Id<"doctorProfiles"> } : "skip");
  return useMemo(() => {
    if (result === undefined) return undefined;
    if (result === null) return null;
    return transformDoctor(result);
  }, [result]);
}

/**
 * Search doctors by query
 */
export function useSearchDoctors(query: string) {
  const result = useQuery(
    api.doctors.search,
    query.length > 0 ? { query } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map(transformDoctor);
  }, [result]);
}
