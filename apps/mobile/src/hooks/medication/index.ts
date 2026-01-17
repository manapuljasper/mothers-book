/**
 * Medication Convex Hooks
 *
 * Query and mutation hooks for medication operations using Convex.
 */

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import type { Medication, MedicationWithLogs, MedicationIntakeLog } from "../../types";

// Transform intake log document
type ConvexIntakeLog = {
  _id: Id<"medicationIntakeLogs">;
  _creationTime: number;
  medicationId: Id<"medications">;
  scheduledDate: number;
  doseIndex: number;
  status: MedicationIntakeLog["status"];
  takenAt?: number;
  recordedByUserId: Id<"users">;
  notes?: string;
};

function transformIntakeLog(doc: ConvexIntakeLog): MedicationIntakeLog {
  return {
    id: doc._id as string,
    medicationId: doc.medicationId as string,
    scheduledDate: new Date(doc.scheduledDate),
    doseIndex: doc.doseIndex,
    status: doc.status,
    takenAt: doc.takenAt ? new Date(doc.takenAt) : undefined,
    recordedByUserId: doc.recordedByUserId as string,
    notes: doc.notes,
    createdAt: new Date(doc._creationTime),
  };
}

// Transform medication document
type ConvexMedication = {
  _id: Id<"medications">;
  _creationTime: number;
  bookletId: Id<"booklets">;
  medicalEntryId?: Id<"medicalEntries">;
  name: string;
  dosage: string;
  instructions?: string;
  startDate: number;
  endDate?: number;
  frequencyPerDay: Medication["frequencyPerDay"];
  timesOfDay?: string[];
  isActive: boolean;
  intakeLogs?: ConvexIntakeLog[];
  todayLogs?: ConvexIntakeLog[];
  adherenceRate?: number;
};

function transformMedication(doc: ConvexMedication): MedicationWithLogs {
  return {
    id: doc._id as string,
    bookletId: doc.bookletId as string,
    medicalEntryId: doc.medicalEntryId as string | undefined,
    name: doc.name,
    dosage: doc.dosage,
    instructions: doc.instructions,
    startDate: new Date(doc.startDate),
    endDate: doc.endDate ? new Date(doc.endDate) : undefined,
    frequencyPerDay: doc.frequencyPerDay,
    timesOfDay: doc.timesOfDay,
    isActive: doc.isActive,
    createdAt: new Date(doc._creationTime),
    intakeLogs: (doc.intakeLogs || []).map(transformIntakeLog),
    todayLogs: (doc.todayLogs || []).map(transformIntakeLog),
    adherenceRate: doc.adherenceRate ?? 0,
  };
}

// Query hooks

export function useMedicationsByBooklet(bookletId: string | undefined) {
  const result = useQuery(
    api.medications.listByBooklet,
    bookletId ? { bookletId: bookletId as Id<"booklets"> } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformMedication(doc as ConvexMedication));
  }, [result]);
}

export function useMedicationsByEntry(entryId: string | undefined) {
  const result = useQuery(
    api.medications.listByEntry,
    entryId ? { entryId: entryId as Id<"medicalEntries"> } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformMedication(doc as ConvexMedication));
  }, [result]);
}

export function useActiveMedications(bookletId?: string) {
  const result = useQuery(api.medications.listActive, { bookletId: bookletId as Id<"booklets"> | undefined });
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformMedication(doc as ConvexMedication));
  }, [result]);
}

export function useTodayMedications(bookletId?: string) {
  const result = useQuery(api.medications.listToday, { bookletId: bookletId as Id<"booklets"> | undefined });
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformMedication(doc as ConvexMedication));
  }, [result]);
}

export function useMedicationById(id: string | undefined) {
  const result = useQuery(api.medications.getById, id ? { id: id as Id<"medications"> } : "skip");
  return useMemo(() => {
    if (result === undefined) return undefined;
    if (result === null) return null;
    return transformMedication(result as ConvexMedication);
  }, [result]);
}

export function useMedicationAdherence(
  medicationId: string | undefined,
  days: number = 7
) {
  return useQuery(
    api.medications.getAdherence,
    medicationId ? { medicationId: medicationId as Id<"medications">, days } : "skip"
  );
}

// Mutation hooks

export function useCreateMedication() {
  const mutation = useMutation(api.medications.create);

  return async (args: {
    bookletId: string;
    medicalEntryId?: string;
    name: string;
    dosage: string;
    instructions?: string;
    startDate: Date | number;
    endDate?: Date | number;
    frequencyPerDay: Medication["frequencyPerDay"];
    timesOfDay?: string[];
    isActive: boolean;
  }) => {
    const result = await mutation({
      bookletId: args.bookletId as Id<"booklets">,
      medicalEntryId: args.medicalEntryId as Id<"medicalEntries"> | undefined,
      name: args.name,
      dosage: args.dosage,
      instructions: args.instructions,
      startDate: args.startDate instanceof Date ? args.startDate.getTime() : args.startDate,
      endDate: args.endDate instanceof Date ? args.endDate.getTime() : args.endDate,
      frequencyPerDay: args.frequencyPerDay,
      timesOfDay: args.timesOfDay,
      isActive: args.isActive,
    });
    return result ? transformMedication(result as ConvexMedication) : null;
  };
}

export function useUpdateMedication() {
  const mutation = useMutation(api.medications.update);

  return async (args: {
    id: string;
    updates: {
      name?: string;
      dosage?: string;
      instructions?: string;
      startDate?: Date | number;
      endDate?: Date | number;
      frequencyPerDay?: Medication["frequencyPerDay"];
      timesOfDay?: string[];
      isActive?: boolean;
    };
  }) => {
    const result = await mutation({
      id: args.id as Id<"medications">,
      name: args.updates.name,
      dosage: args.updates.dosage,
      instructions: args.updates.instructions,
      startDate: args.updates.startDate instanceof Date ? args.updates.startDate.getTime() : args.updates.startDate,
      endDate: args.updates.endDate instanceof Date ? args.updates.endDate.getTime() : args.updates.endDate,
      frequencyPerDay: args.updates.frequencyPerDay,
      timesOfDay: args.updates.timesOfDay,
      isActive: args.updates.isActive,
    });
    return result ? transformMedication(result as ConvexMedication) : null;
  };
}

export function useDeactivateMedication() {
  const mutation = useMutation(api.medications.deactivate);

  return async (id: string) => {
    const result = await mutation({ id: id as Id<"medications"> });
    return result ? transformMedication(result as ConvexMedication) : null;
  };
}

export function useDeleteMedication() {
  const mutation = useMutation(api.medications.deleteMedication);

  return async (id: string) => {
    return await mutation({ id: id as Id<"medications"> });
  };
}

export function useLogIntake() {
  const mutation = useMutation(api.medications.logIntake);

  return async (args: {
    medicationId: string;
    doseIndex: number;
    status: MedicationIntakeLog["status"];
    userId: Id<"users">;
    scheduledDate?: Date | number;
  }) => {
    return await mutation({
      medicationId: args.medicationId as Id<"medications">,
      doseIndex: args.doseIndex,
      status: args.status,
      userId: args.userId,
      scheduledDate: args.scheduledDate instanceof Date ? args.scheduledDate.getTime() : args.scheduledDate,
    });
  };
}
