/**
 * Medication Convex Hooks
 *
 * Query and mutation hooks for medication operations using Convex.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Query hooks

export function useMedicationsByBooklet(bookletId: Id<"booklets"> | undefined) {
  return useQuery(
    api.medications.listByBooklet,
    bookletId ? { bookletId } : "skip"
  );
}

export function useMedicationsByEntry(entryId: Id<"medicalEntries"> | undefined) {
  return useQuery(
    api.medications.listByEntry,
    entryId ? { entryId } : "skip"
  );
}

export function useActiveMedications(bookletId?: Id<"booklets">) {
  return useQuery(api.medications.listActive, { bookletId });
}

export function useTodayMedications(bookletId?: Id<"booklets">) {
  return useQuery(api.medications.listToday, { bookletId });
}

export function useMedicationById(id: Id<"medications"> | undefined) {
  return useQuery(api.medications.getById, id ? { id } : "skip");
}

export function useMedicationAdherence(
  medicationId: Id<"medications"> | undefined,
  days: number = 7
) {
  return useQuery(
    api.medications.getAdherence,
    medicationId ? { medicationId, days } : "skip"
  );
}

// Mutation hooks

export function useCreateMedication() {
  return useMutation(api.medications.create);
}

export function useUpdateMedication() {
  return useMutation(api.medications.update);
}

export function useDeactivateMedication() {
  return useMutation(api.medications.deactivate);
}

export function useDeleteMedication() {
  return useMutation(api.medications.deleteMedication);
}

export function useLogIntake() {
  // Convex automatically syncs all queries after mutation
  // No manual cache invalidation needed
  return useMutation(api.medications.logIntake);
}
