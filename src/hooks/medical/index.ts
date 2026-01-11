/**
 * Medical Convex Hooks
 *
 * Query and mutation hooks for medical entries and lab requests using Convex.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Entry hooks

export function useEntriesByBooklet(bookletId: Id<"booklets"> | undefined) {
  return useQuery(
    api.medical.listEntriesByBooklet,
    bookletId ? { bookletId } : "skip"
  );
}

export function useEntryById(id: Id<"medicalEntries"> | undefined) {
  return useQuery(api.medical.getEntryById, id ? { id } : "skip");
}

export function useCreateEntry() {
  return useMutation(api.medical.createEntry);
}

export function useUpdateEntry() {
  return useMutation(api.medical.updateEntry);
}

// Lab hooks

export function useLabsByBooklet(bookletId: Id<"booklets"> | undefined) {
  return useQuery(
    api.medical.listLabsByBooklet,
    bookletId ? { bookletId } : "skip"
  );
}

export function useLabsByEntry(entryId: Id<"medicalEntries"> | undefined) {
  return useQuery(
    api.medical.listLabsByEntry,
    entryId ? { entryId } : "skip"
  );
}

export function usePendingLabs(bookletId?: Id<"booklets">) {
  return useQuery(api.medical.listPendingLabs, { bookletId });
}

export function useCreateLabRequest() {
  return useMutation(api.medical.createLab);
}

export function useUpdateLabStatus() {
  return useMutation(api.medical.updateLabStatus);
}

export function useDeleteLabRequest() {
  return useMutation(api.medical.deleteLab);
}
