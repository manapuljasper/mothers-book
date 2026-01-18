/**
 * Medical Convex Hooks
 *
 * Query and mutation hooks for medical entries and lab requests using Convex.
 */

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import type {
  MedicalEntry,
  MedicalEntryWithDoctor,
  LabRequest,
  LabRequestWithDoctor,
  PendingMedication,
  PendingLabRequest,
  MedicationFrequency,
} from "../../types";

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
  riskLevel?: "low" | "high";
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
    riskLevel: doc.riskLevel,
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
  priority?: "routine" | "urgent" | "stat";
  dueDate?: number;
  requestedDate: number;
  completedDate?: number;
  results?: string;
  notes?: string;
  // Lab result attachments
  attachments?: Id<"_storage">[];
  uploadedByMotherId?: Id<"motherProfiles">;
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
    priority: doc.priority,
    dueDate: doc.dueDate ? new Date(doc.dueDate) : undefined,
    requestedDate: new Date(doc.requestedDate),
    completedDate: doc.completedDate ? new Date(doc.completedDate) : undefined,
    results: doc.results,
    notes: doc.notes,
    attachments: doc.attachments?.map((id) => id as string),
    uploadedByMotherId: doc.uploadedByMotherId as string | undefined,
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

export function usePendingLabsByDoctor(doctorId: Id<"doctorProfiles"> | undefined) {
  const result = useQuery(
    api.medical.listPendingLabsByDoctor,
    doctorId ? { doctorId } : "skip"
  );
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

// Today's entries by doctor hooks

type ConvexEntryWithDetails = ConvexEntry & {
  bookletLabel: string;
  motherName: string;
  lastMenstrualPeriod?: number;
};

export interface EntryWithPatientDetails extends MedicalEntryWithDoctor {
  bookletLabel: string;
  motherName: string;
  lastMenstrualPeriod?: Date;
}

function transformEntryWithDetails(doc: ConvexEntryWithDetails): EntryWithPatientDetails {
  return {
    ...transformEntry(doc),
    bookletLabel: doc.bookletLabel,
    motherName: doc.motherName,
    lastMenstrualPeriod: doc.lastMenstrualPeriod ? new Date(doc.lastMenstrualPeriod) : undefined,
  };
}

export function useEntriesByDoctorToday(doctorId: Id<"doctorProfiles"> | undefined) {
  const result = useQuery(
    api.medical.listEntriesByDoctorToday,
    doctorId ? { doctorId } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformEntryWithDetails(doc as ConvexEntryWithDetails));
  }, [result]);
}

// ========== Create/Update Entry With Items ==========

/**
 * Create a medical entry with linked medications and lab requests atomically
 */
export function useCreateEntryWithItems() {
  const mutation = useMutation(api.medical.createEntryWithItems);

  return async (args: {
    bookletId: string;
    doctorId: Id<"doctorProfiles">;
    entryType: MedicalEntry["entryType"];
    visitDate: Date | number;
    notes: string;
    vitals?: MedicalEntry["vitals"];
    diagnosis?: string;
    recommendations?: string;
    riskLevel?: "low" | "high";
    followUpDate?: Date | number;
    attachments?: string[];
    medications?: PendingMedication[];
    labRequests?: PendingLabRequest[];
  }) => {
    // Transform pending medications to the format expected by the mutation
    const medications = args.medications?.map((med) => ({
      name: med.name,
      dosageAmount: med.dosageAmount,
      dosageUnit: med.dosageUnit,
      instructions: med.instructions || undefined,
      frequencyPerDay: med.frequencyPerDay,
      endDate: med.endDate ? med.endDate.getTime() : undefined,
    }));

    // Transform pending lab requests
    const labRequests = args.labRequests?.map((lab) => ({
      name: lab.name,
      notes: lab.notes,
      priority: lab.priority,
      dueDate: lab.dueDate ? lab.dueDate.getTime() : undefined,
    }));

    return await mutation({
      bookletId: args.bookletId as Id<"booklets">,
      doctorId: args.doctorId,
      entryType: args.entryType,
      visitDate: args.visitDate instanceof Date ? args.visitDate.getTime() : args.visitDate,
      notes: args.notes,
      vitals: args.vitals,
      diagnosis: args.diagnosis,
      recommendations: args.recommendations,
      riskLevel: args.riskLevel,
      followUpDate: args.followUpDate instanceof Date ? args.followUpDate.getTime() : args.followUpDate,
      attachments: args.attachments,
      medications,
      labRequests,
    });
  };
}

/**
 * Update a medical entry with new/removed medications and lab requests
 */
export function useUpdateEntryWithItems() {
  const mutation = useMutation(api.medical.updateEntryWithItems);

  return async (args: {
    entryId: string;
    entryType?: MedicalEntry["entryType"];
    visitDate?: Date | number;
    notes?: string;
    vitals?: MedicalEntry["vitals"];
    diagnosis?: string;
    recommendations?: string;
    riskLevel?: "low" | "high";
    followUpDate?: Date | number;
    attachments?: string[];
    newMedications?: PendingMedication[];
    newLabRequests?: PendingLabRequest[];
    removeMedicationIds?: string[];
    removeLabRequestIds?: string[];
  }) => {
    // Transform new medications
    const newMedications = args.newMedications?.map((med) => ({
      name: med.name,
      dosageAmount: med.dosageAmount,
      dosageUnit: med.dosageUnit,
      instructions: med.instructions || undefined,
      frequencyPerDay: med.frequencyPerDay,
      endDate: med.endDate ? med.endDate.getTime() : undefined,
    }));

    // Transform new lab requests
    const newLabRequests = args.newLabRequests?.map((lab) => ({
      name: lab.name,
      notes: lab.notes,
      priority: lab.priority,
      dueDate: lab.dueDate ? lab.dueDate.getTime() : undefined,
    }));

    return await mutation({
      entryId: args.entryId as Id<"medicalEntries">,
      entryType: args.entryType,
      visitDate: args.visitDate instanceof Date ? args.visitDate.getTime() : args.visitDate,
      notes: args.notes,
      vitals: args.vitals,
      diagnosis: args.diagnosis,
      recommendations: args.recommendations,
      riskLevel: args.riskLevel,
      followUpDate: args.followUpDate instanceof Date ? args.followUpDate.getTime() : args.followUpDate,
      attachments: args.attachments,
      newMedications,
      newLabRequests,
      removeMedicationIds: args.removeMedicationIds?.map((id) => id as Id<"medications">),
      removeLabRequestIds: args.removeLabRequestIds?.map((id) => id as Id<"labRequests">),
    });
  };
}

// ========== Lab Result Upload Hooks ==========

/**
 * Generate upload URL for lab result attachment
 */
export function useGenerateLabUploadUrl() {
  const mutation = useMutation(api.medical.generateLabUploadUrl);
  return mutation;
}

/**
 * Upload lab result with attachments
 */
export function useUploadLabResult() {
  const mutation = useMutation(api.medical.uploadLabResult);

  return async (args: {
    labId: string;
    storageIds: string[];
    motherId: string;
  }) => {
    const result = await mutation({
      labId: args.labId as Id<"labRequests">,
      storageIds: args.storageIds as Id<"_storage">[],
      motherId: args.motherId as Id<"motherProfiles">,
    });
    return result ? transformLab(result as ConvexLab) : null;
  };
}

/**
 * Get signed URLs for lab attachments
 */
export function useLabAttachmentUrls(labId: string | undefined) {
  return useQuery(
    api.medical.getLabAttachmentUrls,
    labId ? { labId: labId as Id<"labRequests"> } : "skip"
  );
}
