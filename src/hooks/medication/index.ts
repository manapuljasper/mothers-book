/**
 * Medication React Query Hooks
 *
 * Query and mutation hooks for medication operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../api";
import type {
  Medication,
  MedicationWithLogs,
  MedicationIntakeLog,
  IntakeStatus,
} from "../../types";

// Query keys for cache management
export const medicationKeys = {
  all: ["medications"] as const,
  lists: () => [...medicationKeys.all, "list"] as const,
  listByBooklet: (bookletId: string) =>
    [...medicationKeys.lists(), "booklet", bookletId] as const,
  listByEntry: (entryId: string) =>
    [...medicationKeys.lists(), "entry", entryId] as const,
  active: (bookletId?: string) =>
    [...medicationKeys.all, "active", bookletId] as const,
  today: (bookletId?: string) =>
    [...medicationKeys.all, "today", bookletId] as const,
  details: () => [...medicationKeys.all, "detail"] as const,
  detail: (id: string) => [...medicationKeys.details(), id] as const,
  adherence: (id: string, days?: number) =>
    [...medicationKeys.all, "adherence", id, days] as const,
};

// Query hooks

export function useMedicationsByBooklet(bookletId: string | undefined) {
  return useQuery({
    queryKey: medicationKeys.listByBooklet(bookletId || ""),
    queryFn: () => api.getMedicationsByBooklet(bookletId!),
    enabled: !!bookletId,
  });
}

export function useMedicationsByEntry(entryId: string | undefined) {
  return useQuery({
    queryKey: medicationKeys.listByEntry(entryId || ""),
    queryFn: () => api.getMedicationsByEntry(entryId!),
    enabled: !!entryId,
  });
}

export function useActiveMedications(bookletId?: string) {
  return useQuery({
    queryKey: medicationKeys.active(bookletId),
    queryFn: () => api.getActiveMedications(bookletId),
  });
}

export function useTodayMedications(bookletId?: string) {
  return useQuery({
    queryKey: medicationKeys.today(bookletId),
    queryFn: () => api.getTodayMedications(bookletId),
  });
}

export function useMedicationById(id: string | undefined) {
  return useQuery({
    queryKey: medicationKeys.detail(id || ""),
    queryFn: () => api.getMedicationById(id!),
    enabled: !!id,
  });
}

export function useMedicationAdherence(
  medicationId: string | undefined,
  days: number = 7
) {
  return useQuery({
    queryKey: medicationKeys.adherence(medicationId || "", days),
    queryFn: () => api.getMedicationAdherence(medicationId!, days),
    enabled: !!medicationId,
  });
}

// Mutation hooks

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Medication, "id" | "createdAt" | "updatedAt">) =>
      api.createMedication(data),
    onSuccess: (newMed) => {
      // Invalidate specific booklet cache
      queryClient.invalidateQueries({
        queryKey: medicationKeys.listByBooklet(newMed.bookletId),
      });
      // Also invalidate entry-specific cache if medicalEntryId exists
      if (newMed.medicalEntryId) {
        queryClient.invalidateQueries({
          queryKey: medicationKeys.listByEntry(newMed.medicalEntryId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: medicationKeys.active(newMed.bookletId),
      });
      queryClient.invalidateQueries({
        queryKey: medicationKeys.today(newMed.bookletId),
      });
      // Set new medication in cache
      queryClient.setQueryData(medicationKeys.detail(newMed.id), newMed);
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Medication>;
    }) => api.updateMedication(id, updates),
    onSuccess: (updatedMed) => {
      // Invalidate specific booklet cache
      queryClient.invalidateQueries({
        queryKey: medicationKeys.listByBooklet(updatedMed.bookletId),
      });
      if (updatedMed.medicalEntryId) {
        queryClient.invalidateQueries({
          queryKey: medicationKeys.listByEntry(updatedMed.medicalEntryId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: medicationKeys.active(updatedMed.bookletId),
      });
      queryClient.invalidateQueries({
        queryKey: medicationKeys.today(updatedMed.bookletId),
      });
      queryClient.setQueryData(
        medicationKeys.detail(updatedMed.id),
        updatedMed
      );
    },
  });
}

export function useDeactivateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deactivateMedication(id),
    onSuccess: (deactivatedMed) => {
      queryClient.invalidateQueries({
        queryKey: medicationKeys.listByBooklet(deactivatedMed.bookletId),
      });
      queryClient.invalidateQueries({
        queryKey: medicationKeys.active(deactivatedMed.bookletId),
      });
      queryClient.invalidateQueries({
        queryKey: medicationKeys.today(deactivatedMed.bookletId),
      });
      queryClient.setQueryData(
        medicationKeys.detail(deactivatedMed.id),
        deactivatedMed
      );
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteMedication(id),
    onSuccess: () => {
      // Invalidate all medication-related caches
      queryClient.invalidateQueries({
        queryKey: medicationKeys.all,
      });
    },
  });
}

export function useLogIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      medicationId,
      doseIndex,
      status,
      userId,
      date,
    }: {
      medicationId: string;
      doseIndex: number;
      status: IntakeStatus;
      userId: string;
      date?: Date;
    }) => api.logIntake(medicationId, doseIndex, status, userId, date),

    // Optimistic update - immediately update cache on tap
    onMutate: async ({ medicationId, doseIndex, status }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: medicationKeys.active() });

      // Snapshot previous value for rollback
      const previousMeds = queryClient.getQueryData<MedicationWithLogs[]>(
        medicationKeys.active()
      );

      // Optimistically update the cache
      queryClient.setQueryData<MedicationWithLogs[]>(
        medicationKeys.active(),
        (old) => {
          if (!old) return old;
          return old.map((med) => {
            if (med.id !== medicationId) return med;

            const todayLogs = [...(med.todayLogs || [])];
            const existingLogIndex = todayLogs.findIndex(
              (l) => l.doseIndex === doseIndex
            );

            if (existingLogIndex >= 0) {
              // Update existing log
              todayLogs[existingLogIndex] = {
                ...todayLogs[existingLogIndex],
                status,
              };
            } else {
              // Add new log
              todayLogs.push({
                id: `temp-${Date.now()}`,
                medicationId,
                doseIndex,
                status,
                scheduledDate: new Date(),
                recordedByUserId: "",
                createdAt: new Date(),
              } as MedicationIntakeLog);
            }

            return { ...med, todayLogs };
          });
        }
      );

      return { previousMeds };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousMeds) {
        queryClient.setQueryData(medicationKeys.active(), context.previousMeds);
      }
    },

    // Refetch after mutation settles to sync with server
    onSettled: (log) => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicationKeys.active() });
      queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
      if (log) {
        queryClient.invalidateQueries({
          queryKey: medicationKeys.adherence(log.medicationId),
        });
      }
    },
  });
}
