/**
 * Favorites Convex Hooks
 *
 * Query and mutation hooks for doctor favorites (frequently used medications/labs).
 */

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import type { DoctorFavorite, LabPriority } from "../../types";

// Transform favorite document to app type
type ConvexFavorite = {
  _id: Id<"doctorFavorites">;
  _creationTime: number;
  doctorId: Id<"doctorProfiles">;
  itemType: "medication" | "lab";
  name: string;
  genericName?: string;
  defaultDosage?: number;
  defaultDosageUnit?: string;
  defaultFrequency?: number;
  defaultInstructions?: string;
  labCode?: string;
  defaultPriority?: "routine" | "urgent" | "stat";
  usageCount: number;
  lastUsedAt: number;
  hasCustomDefaults: boolean;
};

function transformFavorite(doc: ConvexFavorite): DoctorFavorite {
  return {
    id: doc._id as string,
    doctorId: doc.doctorId as string,
    itemType: doc.itemType,
    name: doc.name,
    genericName: doc.genericName,
    defaultDosage: doc.defaultDosage,
    defaultDosageUnit: doc.defaultDosageUnit,
    defaultFrequency: doc.defaultFrequency,
    defaultInstructions: doc.defaultInstructions,
    labCode: doc.labCode,
    defaultPriority: doc.defaultPriority as LabPriority | undefined,
    usageCount: doc.usageCount,
    lastUsedAt: new Date(doc.lastUsedAt),
    hasCustomDefaults: doc.hasCustomDefaults,
  };
}

// ========== Query Hooks ==========

/**
 * Get top medication favorites for a doctor (sorted by usage)
 */
export function useMedicationFavorites(
  doctorId: Id<"doctorProfiles"> | undefined
) {
  const result = useQuery(
    api.favorites.listMedicationFavorites,
    doctorId ? { doctorId } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformFavorite(doc as ConvexFavorite));
  }, [result]);
}

/**
 * Get top lab favorites for a doctor (sorted by usage)
 */
export function useLabFavorites(doctorId: Id<"doctorProfiles"> | undefined) {
  const result = useQuery(
    api.favorites.listLabFavorites,
    doctorId ? { doctorId } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformFavorite(doc as ConvexFavorite));
  }, [result]);
}

/**
 * Get all favorites for a doctor (for management UI)
 */
export function useAllFavorites(doctorId: Id<"doctorProfiles"> | undefined) {
  const result = useQuery(
    api.favorites.listAllFavorites,
    doctorId ? { doctorId } : "skip"
  );
  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) => transformFavorite(doc as ConvexFavorite));
  }, [result]);
}

// ========== Mutation Hooks ==========

/**
 * Add a medication or lab to favorites
 */
export function useAddToFavorites() {
  const mutation = useMutation(api.favorites.addToFavorites);

  return async (args: {
    doctorId: Id<"doctorProfiles">;
    itemType: "medication" | "lab";
    name: string;
    genericName?: string;
    // Medication fields
    defaultDosage?: number;
    defaultDosageUnit?: string;
    defaultFrequency?: number;
    defaultInstructions?: string;
    // Lab fields
    labCode?: string;
    defaultPriority?: LabPriority;
    hasCustomDefaults?: boolean;
  }) => {
    return await mutation({
      doctorId: args.doctorId,
      itemType: args.itemType,
      name: args.name,
      genericName: args.genericName,
      defaultDosage: args.defaultDosage,
      defaultDosageUnit: args.defaultDosageUnit,
      defaultFrequency: args.defaultFrequency,
      defaultInstructions: args.defaultInstructions,
      labCode: args.labCode,
      defaultPriority: args.defaultPriority,
      hasCustomDefaults: args.hasCustomDefaults,
    });
  };
}

/**
 * Increment usage count for a favorite (by ID)
 */
export function useIncrementFavoriteUsage() {
  const mutation = useMutation(api.favorites.incrementUsage);

  return async (favoriteId: string) => {
    return await mutation({
      favoriteId: favoriteId as Id<"doctorFavorites">,
    });
  };
}

/**
 * Increment usage by name (auto-creates favorite if not exists)
 */
export function useIncrementUsageByName() {
  const mutation = useMutation(api.favorites.incrementUsageByName);

  return async (args: {
    doctorId: Id<"doctorProfiles">;
    itemType: "medication" | "lab";
    name: string;
    genericName?: string;
    defaultDosage?: number;
    defaultDosageUnit?: string;
    defaultFrequency?: number;
    defaultInstructions?: string;
    labCode?: string;
    defaultPriority?: LabPriority;
  }) => {
    return await mutation({
      doctorId: args.doctorId,
      itemType: args.itemType,
      name: args.name,
      genericName: args.genericName,
      defaultDosage: args.defaultDosage,
      defaultDosageUnit: args.defaultDosageUnit,
      defaultFrequency: args.defaultFrequency,
      defaultInstructions: args.defaultInstructions,
      labCode: args.labCode,
      defaultPriority: args.defaultPriority,
    });
  };
}

/**
 * Save custom defaults for an existing favorite
 */
export function useSaveWithCustomDefaults() {
  const mutation = useMutation(api.favorites.saveWithCustomDefaults);

  return async (args: {
    favoriteId: string;
    defaultDosage?: number;
    defaultDosageUnit?: string;
    defaultFrequency?: number;
    defaultInstructions?: string;
    defaultPriority?: LabPriority;
  }) => {
    return await mutation({
      favoriteId: args.favoriteId as Id<"doctorFavorites">,
      defaultDosage: args.defaultDosage,
      defaultDosageUnit: args.defaultDosageUnit,
      defaultFrequency: args.defaultFrequency,
      defaultInstructions: args.defaultInstructions,
      defaultPriority: args.defaultPriority,
    });
  };
}

/**
 * Remove a favorite
 */
export function useRemoveFromFavorites() {
  const mutation = useMutation(api.favorites.removeFromFavorites);

  return async (favoriteId: string) => {
    return await mutation({
      favoriteId: favoriteId as Id<"doctorFavorites">,
    });
  };
}
