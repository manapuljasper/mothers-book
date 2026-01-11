/**
 * Medical React Query Hooks
 *
 * Query and mutation hooks for medical entries and lab requests.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api';
import type { MedicalEntry, LabRequest, LabStatus } from '../../types';

// Query keys for cache management
export const medicalKeys = {
  all: ['medical'] as const,

  // Entries
  entries: () => [...medicalKeys.all, 'entries'] as const,
  entriesByBooklet: (bookletId: string) => [...medicalKeys.entries(), 'booklet', bookletId] as const,
  entry: (id: string) => [...medicalKeys.entries(), id] as const,

  // Labs
  labs: () => [...medicalKeys.all, 'labs'] as const,
  labsByBooklet: (bookletId: string) => [...medicalKeys.labs(), 'booklet', bookletId] as const,
  labsByEntry: (entryId: string) => [...medicalKeys.labs(), 'entry', entryId] as const,
  pendingLabs: (bookletId?: string) => [...medicalKeys.labs(), 'pending', bookletId] as const,
};

// Entry hooks

export function useEntriesByBooklet(bookletId: string | undefined) {
  return useQuery({
    queryKey: medicalKeys.entriesByBooklet(bookletId || ''),
    queryFn: () => api.getEntriesByBooklet(bookletId!),
    enabled: !!bookletId,
  });
}

export function useEntryById(id: string | undefined) {
  return useQuery({
    queryKey: medicalKeys.entry(id || ''),
    queryFn: () => api.getEntryById(id!),
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MedicalEntry, 'id' | 'createdAt'>) => api.createEntry(data),
    onSuccess: (newEntry) => {
      // Invalidate entries list for the booklet
      queryClient.invalidateQueries({
        queryKey: medicalKeys.entriesByBooklet(newEntry.bookletId),
      });
      // Set new entry in cache
      queryClient.setQueryData(medicalKeys.entry(newEntry.id), newEntry);
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MedicalEntry> }) =>
      api.updateEntry(id, updates),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({
        queryKey: medicalKeys.entriesByBooklet(updatedEntry.bookletId),
      });
      queryClient.setQueryData(medicalKeys.entry(updatedEntry.id), updatedEntry);
    },
  });
}

// Lab hooks

export function useLabsByBooklet(bookletId: string | undefined) {
  return useQuery({
    queryKey: medicalKeys.labsByBooklet(bookletId || ''),
    queryFn: () => api.getLabsByBooklet(bookletId!),
    enabled: !!bookletId,
  });
}

export function useLabsByEntry(entryId: string | undefined) {
  return useQuery({
    queryKey: medicalKeys.labsByEntry(entryId || ''),
    queryFn: () => api.getLabsByEntry(entryId!),
    enabled: !!entryId,
  });
}

export function usePendingLabs(bookletId?: string) {
  return useQuery({
    queryKey: medicalKeys.pendingLabs(bookletId),
    queryFn: () => api.getPendingLabs(bookletId),
  });
}

export function useCreateLabRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<LabRequest, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.createLabRequest(data),
    onSuccess: (newLab) => {
      // Invalidate specific booklet cache
      queryClient.invalidateQueries({
        queryKey: medicalKeys.labsByBooklet(newLab.bookletId),
      });
      queryClient.invalidateQueries({
        queryKey: medicalKeys.pendingLabs(newLab.bookletId),
      });
      // Also invalidate entry-specific cache if medicalEntryId exists
      if (newLab.medicalEntryId) {
        queryClient.invalidateQueries({
          queryKey: medicalKeys.labsByEntry(newLab.medicalEntryId),
        });
      }
    },
  });
}

export function useUpdateLabStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      results,
    }: {
      id: string;
      status: LabStatus;
      results?: string;
    }) => api.updateLabStatus(id, status, results),
    onSuccess: (updatedLab) => {
      // Invalidate specific booklet cache
      queryClient.invalidateQueries({
        queryKey: medicalKeys.labsByBooklet(updatedLab.bookletId),
      });
      queryClient.invalidateQueries({
        queryKey: medicalKeys.pendingLabs(updatedLab.bookletId),
      });
      // Also invalidate entry-specific cache if medicalEntryId exists
      if (updatedLab.medicalEntryId) {
        queryClient.invalidateQueries({
          queryKey: medicalKeys.labsByEntry(updatedLab.medicalEntryId),
        });
      }
    },
  });
}
