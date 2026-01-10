/**
 * Booklet React Query Hooks
 *
 * Query and mutation hooks for booklet operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api';
import type { MotherBooklet, BookletWithMother, BookletAccess, DoctorProfile } from '../../types';

// Query keys for cache management
export const bookletKeys = {
  all: ['booklets'] as const,
  lists: () => [...bookletKeys.all, 'list'] as const,
  listByMother: (motherId: string) => [...bookletKeys.lists(), 'mother', motherId] as const,
  listByDoctor: (doctorId: string) => [...bookletKeys.lists(), 'doctor', doctorId] as const,
  details: () => [...bookletKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookletKeys.details(), id] as const,
  doctors: (bookletId: string) => [...bookletKeys.all, 'doctors', bookletId] as const,
};

// GET hooks

export function useBookletById(id: string | undefined) {
  return useQuery({
    queryKey: bookletKeys.detail(id || ''),
    queryFn: () => api.getBookletById(id!),
    enabled: !!id,
  });
}

export function useBookletsByMother(motherId: string | undefined) {
  return useQuery({
    queryKey: bookletKeys.listByMother(motherId || ''),
    queryFn: () => api.getBookletsByMother(motherId!),
    enabled: !!motherId,
  });
}

export function useBookletsByDoctor(doctorId: string | undefined) {
  return useQuery({
    queryKey: bookletKeys.listByDoctor(doctorId || ''),
    queryFn: () => api.getBookletsByDoctor(doctorId!),
    enabled: !!doctorId,
  });
}

export function useBookletDoctors(bookletId: string | undefined) {
  return useQuery({
    queryKey: bookletKeys.doctors(bookletId || ''),
    queryFn: () => api.getBookletDoctors(bookletId!),
    enabled: !!bookletId,
  });
}

// Mutation hooks

export function useCreateBooklet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MotherBooklet, 'id' | 'createdAt'>) => api.createBooklet(data),
    onSuccess: (newBooklet) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: bookletKeys.lists() });
      // Optionally set the new booklet in cache
      queryClient.setQueryData(bookletKeys.detail(newBooklet.id), newBooklet);
    },
  });
}

export function useUpdateBooklet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MotherBooklet> }) =>
      api.updateBooklet(id, updates),
    onSuccess: (updatedBooklet) => {
      queryClient.invalidateQueries({ queryKey: bookletKeys.lists() });
      queryClient.setQueryData(bookletKeys.detail(updatedBooklet.id), updatedBooklet);
    },
  });
}

export function useGrantDoctorAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookletId, doctorId }: { bookletId: string; doctorId: string }) =>
      api.grantDoctorAccess(bookletId, doctorId),
    onSuccess: (_, { bookletId }) => {
      queryClient.invalidateQueries({ queryKey: bookletKeys.doctors(bookletId) });
      queryClient.invalidateQueries({ queryKey: bookletKeys.lists() });
    },
  });
}

export function useRevokeDoctorAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookletId, doctorId }: { bookletId: string; doctorId: string }) =>
      api.revokeDoctorAccess(bookletId, doctorId),
    onSuccess: (_, { bookletId }) => {
      queryClient.invalidateQueries({ queryKey: bookletKeys.doctors(bookletId) });
      queryClient.invalidateQueries({ queryKey: bookletKeys.lists() });
    },
  });
}
