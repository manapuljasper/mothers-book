/**
 * Booklet Convex Hooks
 *
 * Query and mutation hooks for booklet operations using Convex.
 */

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id, Doc } from "@convex/_generated/dataModel";
import type { MotherBooklet, BookletWithMother } from "../../types";

// Transform Convex booklet document to app type
function transformBooklet(doc: Doc<"booklets">): MotherBooklet {
  return {
    id: doc._id,
    motherId: doc.motherId,
    label: doc.label,
    status: doc.status,
    createdAt: new Date(doc._creationTime),
    lastMenstrualPeriod: doc.lastMenstrualPeriod
      ? new Date(doc.lastMenstrualPeriod)
      : undefined,
    expectedDueDate: doc.expectedDueDate
      ? new Date(doc.expectedDueDate)
      : undefined,
    actualDeliveryDate: doc.actualDeliveryDate
      ? new Date(doc.actualDeliveryDate)
      : undefined,
    currentRiskLevel: doc.currentRiskLevel,
    notes: doc.notes,
    allergies: doc.allergies,
    medicalHistory: doc.medicalHistory,
  };
}

// Query hooks

export function useBookletById(id: string | undefined) {
  const result = useQuery(
    api.booklets.getById,
    id ? { id: id as Id<"booklets"> } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    if (result === null) return null;
    return transformBooklet(result);
  }, [result]);
}

export function useBookletByIdWithMother(id: string | undefined) {
  const result = useQuery(
    api.booklets.getByIdWithMother,
    id ? { id: id as Id<"booklets"> } : "skip"
  );

  return useMemo(() => {
    if (result === undefined) return undefined;
    if (result === null) return null;
    return {
      ...transformBooklet(result),
      motherName: result.motherName,
      motherBirthdate: result.motherBirthdate,
      lastVisitDate: result.lastVisitDate
        ? new Date(result.lastVisitDate)
        : undefined,
      nextAppointment: result.nextAppointment
        ? new Date(result.nextAppointment)
        : undefined,
    } as BookletWithMother;
  }, [result]);
}

export function useBookletsByMother(
  motherId: Id<"motherProfiles"> | undefined
) {
  const result = useQuery(
    api.booklets.listByMother,
    motherId ? { motherId } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map(transformBooklet);
  }, [result]);
}

export function useBookletsByDoctor(
  doctorId: Id<"doctorProfiles"> | undefined,
  clinicId?: Id<"doctorClinics">
) {
  const result = useQuery(
    api.booklets.listByDoctor,
    doctorId ? { doctorId, clinicId } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    // The doctor endpoint returns booklets with mother info, filter out nulls
    return result
      .filter((doc): doc is NonNullable<typeof doc> => doc !== null)
      .map(
        (doc): BookletWithMother => ({
          ...transformBooklet(doc),
          motherName: doc.motherName ?? "Unknown",
          lastVisitDate: doc.lastVisitDate
            ? new Date(doc.lastVisitDate)
            : undefined,
          nextAppointment: doc.nextAppointment
            ? new Date(doc.nextAppointment)
            : undefined,
          hasEntries: doc.hasEntries ?? false,
          // Entry summary data
          latestVitals: doc.latestVitals,
          activeMedicationCount: doc.activeMedicationCount,
          pendingLabCount: doc.pendingLabCount,
          hasAllergies: doc.hasAllergies,
          // Doctor's patient ID
          patientId: doc.patientId,
        })
      );
  }, [result]);
}

export function useBookletDoctors(bookletId: string | undefined) {
  const result = useQuery(
    api.booklets.getDoctors,
    bookletId ? { bookletId: bookletId as Id<"booklets"> } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    // Filter out nulls and transform
    return result
      .filter((doc): doc is NonNullable<typeof doc> => doc !== null)
      .map((doc) => ({
        id: doc._id as string,
        fullName: doc.fullName,
        specialization: doc.specialization,
        clinicName: doc.clinicName,
      }));
  }, [result]);
}

// Mutation hooks

export function useCreateBooklet() {
  const mutation = useMutation(api.booklets.create);

  return async (args: {
    motherId: Id<"motherProfiles">;
    label: string;
    status: "active" | "completed" | "archived";
    lastMenstrualPeriod?: number;
    expectedDueDate?: number;
    actualDeliveryDate?: number;
    notes?: string;
  }) => {
    const result = await mutation(args);
    return result ? transformBooklet(result) : null;
  };
}

export function useUpdateBooklet() {
  const mutation = useMutation(api.booklets.update);

  return async (args: {
    id: string;
    updates: {
      label?: string;
      status?: "active" | "completed" | "archived";
      lastMenstrualPeriod?: number;
      expectedDueDate?: number;
      actualDeliveryDate?: number;
      notes?: string;
      allergies?: string[];
      medicalHistory?: Array<{
        condition: string;
        notes?: string;
        diagnosedYear?: number;
      }>;
    };
  }) => {
    const result = await mutation({
      id: args.id as Id<"booklets">,
      ...args.updates,
    });
    return result ? transformBooklet(result) : null;
  };
}

export function useGrantDoctorAccess() {
  const mutation = useMutation(api.booklets.grantAccess);

  return async (args: {
    bookletId: string;
    doctorId: Id<"doctorProfiles">;
  }) => {
    return await mutation({
      bookletId: args.bookletId as Id<"booklets">,
      doctorId: args.doctorId,
    });
  };
}

export function useRevokeDoctorAccess() {
  const mutation = useMutation(api.booklets.revokeAccess);

  return async (args: { bookletId: string; doctorId: string }) => {
    return await mutation({
      bookletId: args.bookletId as Id<"booklets">,
      doctorId: args.doctorId as Id<"doctorProfiles">,
    });
  };
}

// Patient ID hooks

export function useAccessPatientId(
  bookletId: string | undefined,
  doctorId: string | undefined
) {
  return useQuery(
    api.booklets.getAccessPatientId,
    bookletId && doctorId
      ? {
          bookletId: bookletId as Id<"booklets">,
          doctorId: doctorId as Id<"doctorProfiles">,
        }
      : "skip"
  );
}

export function useUpdatePatientId() {
  const mutation = useMutation(api.booklets.updateAccessPatientId);

  return async (args: {
    bookletId: string;
    doctorId: string;
    patientId?: string;
  }) => {
    return await mutation({
      bookletId: args.bookletId as Id<"booklets">,
      doctorId: args.doctorId as Id<"doctorProfiles">,
      patientId: args.patientId,
    });
  };
}
