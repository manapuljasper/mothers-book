/**
 * Booklet Convex Hooks
 *
 * Query and mutation hooks for booklet operations using Convex.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Query hooks

export function useBookletById(id: Id<"booklets"> | undefined) {
  return useQuery(api.booklets.getById, id ? { id } : "skip");
}

export function useBookletsByMother(motherId: Id<"motherProfiles"> | undefined) {
  return useQuery(
    api.booklets.listByMother,
    motherId ? { motherId } : "skip"
  );
}

export function useBookletsByDoctor(doctorId: Id<"doctorProfiles"> | undefined) {
  return useQuery(
    api.booklets.listByDoctor,
    doctorId ? { doctorId } : "skip"
  );
}

export function useBookletDoctors(bookletId: Id<"booklets"> | undefined) {
  return useQuery(
    api.booklets.getDoctors,
    bookletId ? { bookletId } : "skip"
  );
}

// Mutation hooks

export function useCreateBooklet() {
  return useMutation(api.booklets.create);
}

export function useUpdateBooklet() {
  return useMutation(api.booklets.update);
}

export function useGrantDoctorAccess() {
  return useMutation(api.booklets.grantAccess);
}

export function useRevokeDoctorAccess() {
  return useMutation(api.booklets.revokeAccess);
}
