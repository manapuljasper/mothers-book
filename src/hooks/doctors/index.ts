/**
 * Doctors React Query Hooks
 *
 * Query hooks for doctor profile operations.
 */

import { useQuery } from '@tanstack/react-query';
import * as api from '../../api';
import type { DoctorProfile } from '../../types';

// Query keys for cache management
export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  search: (query: string) => [...doctorKeys.lists(), 'search', query] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
};

/**
 * Get all doctors
 */
export function useAllDoctors() {
  return useQuery({
    queryKey: doctorKeys.lists(),
    queryFn: () => api.getAllDoctors(),
  });
}

/**
 * Get a doctor by ID
 */
export function useDoctorById(id: string | undefined) {
  return useQuery({
    queryKey: doctorKeys.detail(id || ''),
    queryFn: () => api.getDoctorById(id!),
    enabled: !!id,
  });
}

/**
 * Search doctors by query
 */
export function useSearchDoctors(query: string) {
  return useQuery({
    queryKey: doctorKeys.search(query),
    queryFn: () => api.searchDoctors(query),
    enabled: query.length > 0,
  });
}
