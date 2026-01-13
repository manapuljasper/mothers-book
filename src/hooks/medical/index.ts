/**
 * Medical Convex Hooks
 *
 * Query and mutation hooks for medical entries and lab requests using Convex.
 */

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import type { MedicalEntry, MedicalEntryWithDoctor, LabRequest, LabRequestWithDoctor } from "../../types";

// Transform entry document to app type
type ConvexEntry = {
  _id: Id<"medicalEntries">;
  _creationTime: number;
  bookletId: Id<"booklets">;
  doctorId: Id<"doctorProfiles">;
  entryType: MedicalEntry["entryType"];
  visitDate: number;
  notes?: string;
  vitals?: MedicalEntry["vitals"];
  diagnosis?: string;
  recommendations?: string;
  followUpDate?: number;
  attachments?: string[];
  doctorName?: string;
  doctorSpecialization?: string;
};

function transformEntry(doc: ConvexEntry): MedicalEntryWithDoctor {
  return {
    id: doc._id as string,
    bookletId: doc.bookletId as string,
    doctorId: doc.doctorId as string,
    entryType: doc.entryType,
    visitDate: new Date(doc.visitDate),
    notes: doc.notes || "",
    vitals: doc.vitals,
    diagnosis: doc.diagnosis,
    recommendations: doc.recommendations,
    followUpDate: doc.followUpDate ? new Date(doc.followUpDate) : undefined,
    attachments: doc.attachments,
    createdAt: new Date(doc._creationTime),
    doctorName: doc.doctorName || "Unknown",
    doctorSpecialization: doc.doctorSpecialization,
  };
}

// Transform lab document to app type
type ConvexLab = {
  _id: Id<"labRequests">;
  _creationTime: number;
  bookletId: Id<"booklets">;
  medicalEntryId?: Id<"medicalEntries">;
  requestedByDoctorId?: Id<"doctorProfiles">;
  description: string;
  status: LabRequest["status"];
  requestedDate: number;
  completedDate?: number;
  results?: string;
  notes?: string;
  // Joined fields from listLabsByBooklet
  doctorName?: string;
  doctorSpecialty?: string;
};

function transformLab(doc: ConvexLab): LabRequestWithDoctor {
  return {
    id: doc._id as string,
    bookletId: doc.bookletId as string,
    medicalEntryId: doc.medicalEntryId as string | undefined,
    requestedByDoctorId: doc.requestedByDoctorId as string | undefined,
    description: doc.description,
    status: doc.status,
    requestedDate: new Date(doc.requestedDate),
    completedDate: doc.completedDate ? new Date(doc.completedDate) : undefined,
    results: doc.results,
    notes: doc.notes,
    createdAt: new Date(doc._creationTime),
    doctorName: doc.doctorName,
    doctorSpecialty: doc.doctorSpecialty,
  };
}

// Entry hooks

export function useEntriesByBooklet(bookletId: string | undefined) {
  const result = useQuery(
    api.medical.listEntriesByBooklet,
    bookletId ? { bookletId: bookletId as Id<"booklets"> } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformEntry(doc as ConvexEntry));
  }, [result]);
}

export function useEntryById(id: string | undefined) {
  const result = useQuery(api.medical.getEntryById, id ? { id: id as Id<"medicalEntries"> } : "skip");
  return useMemo(() => {
    if (result === undefined) return undefined;
    if (result === null) return null;
    return transformEntry(result as ConvexEntry);
  }, [result]);
}

export function useCreateEntry() {
  const mutation = useMutation(api.medical.createEntry);

  return async (args: {
    bookletId: string;
    doctorId: Id<"doctorProfiles">;
    entryType: MedicalEntry["entryType"];
    visitDate: Date | number;
    notes: string;
    vitals?: MedicalEntry["vitals"];
    diagnosis?: string;
    recommendations?: string;
    followUpDate?: Date | number;
    attachments?: string[];
  }) => {
    const result = await mutation({
      bookletId: args.bookletId as Id<"booklets">,
      doctorId: args.doctorId,
      entryType: args.entryType,
      visitDate: args.visitDate instanceof Date ? args.visitDate.getTime() : args.visitDate,
      notes: args.notes,
      vitals: args.vitals,
      diagnosis: args.diagnosis,
      recommendations: args.recommendations,
      followUpDate: args.followUpDate instanceof Date ? args.followUpDate.getTime() : args.followUpDate,
      attachments: args.attachments,
    });
    return result ? transformEntry(result as ConvexEntry) : null;
  };
}

export function useUpdateEntry() {
  const mutation = useMutation(api.medical.updateEntry);

  return async (args: {
    id: string;
    updates: {
      entryType?: MedicalEntry["entryType"];
      visitDate?: Date | number;
      notes?: string;
      vitals?: MedicalEntry["vitals"];
      diagnosis?: string;
      recommendations?: string;
      followUpDate?: Date | number;
      attachments?: string[];
    };
  }) => {
    const result = await mutation({
      id: args.id as Id<"medicalEntries">,
      entryType: args.updates.entryType,
      visitDate: args.updates.visitDate instanceof Date ? args.updates.visitDate.getTime() : args.updates.visitDate,
      notes: args.updates.notes,
      vitals: args.updates.vitals,
      diagnosis: args.updates.diagnosis,
      recommendations: args.updates.recommendations,
      followUpDate: args.updates.followUpDate instanceof Date ? args.updates.followUpDate.getTime() : args.updates.followUpDate,
      attachments: args.updates.attachments,
    });
    return result ? transformEntry(result as ConvexEntry) : null;
  };
}

// Lab hooks

export function useLabsByBooklet(bookletId: string | Id<"booklets"> | undefined) {
  const result = useQuery(
    api.medical.listLabsByBooklet,
    bookletId ? { bookletId: bookletId as Id<"booklets"> } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformLab(doc as ConvexLab));
  }, [result]);
}

export function useLabsByEntry(entryId: string | undefined) {
  const result = useQuery(
    api.medical.listLabsByEntry,
    entryId ? { entryId: entryId as Id<"medicalEntries"> } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformLab(doc as ConvexLab));
  }, [result]);
}

export function usePendingLabs(bookletId?: string) {
  const result = useQuery(api.medical.listPendingLabs, { bookletId: bookletId as Id<"booklets"> | undefined });
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformLab(doc as ConvexLab));
  }, [result]);
}

export function useCreateLabRequest() {
  const mutation = useMutation(api.medical.createLab);

  return async (args: {
    bookletId: string;
    medicalEntryId?: string;
    requestedByDoctorId?: string;
    description: string;
    status: LabRequest["status"];
    requestedDate: Date | number;
    completedDate?: Date | number;
    results?: string;
    notes?: string;
  }) => {
    const result = await mutation({
      bookletId: args.bookletId as Id<"booklets">,
      medicalEntryId: args.medicalEntryId as Id<"medicalEntries"> | undefined,
      requestedByDoctorId: args.requestedByDoctorId as Id<"doctorProfiles"> | undefined,
      description: args.description,
      status: args.status,
      requestedDate: args.requestedDate instanceof Date ? args.requestedDate.getTime() : args.requestedDate,
      completedDate: args.completedDate instanceof Date ? args.completedDate.getTime() : args.completedDate,
      results: args.results,
      notes: args.notes,
    });
    return result ? transformLab(result as ConvexLab) : null;
  };
}

export function useUpdateLabStatus() {
  const mutation = useMutation(api.medical.updateLabStatus);

  return async (args: {
    id: string;
    status: LabRequest["status"];
    results?: string;
  }) => {
    const result = await mutation({
      id: args.id as Id<"labRequests">,
      status: args.status,
      results: args.results,
    });
    return result ? transformLab(result as ConvexLab) : null;
  };
}

export function useDeleteLabRequest() {
  const mutation = useMutation(api.medical.deleteLab);

  return async (id: string) => {
    return await mutation({ id: id as Id<"labRequests"> });
  };
}
