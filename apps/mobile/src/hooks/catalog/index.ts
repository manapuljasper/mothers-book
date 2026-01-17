/**
 * Catalog Convex Hooks
 *
 * Query hooks for medication and lab test catalogs (libraries).
 * These are read-only hooks for doctors to search and select from standard items.
 */

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import type {
  MedicationCatalogItem,
  LabCatalogItem,
  CategoryWithCount,
  MedicationCategory,
  LabCategory,
} from "../../types";

// ============================================================================
// Transform Functions
// ============================================================================

type ConvexMedicationCatalogItem = {
  _id: Id<"medicationCatalog">;
  _creationTime: number;
  name: string;
  genericName: string;
  category: string;
  dosage?: number;
  dosageUnit?: string;
  availableUnits?: string[];
  availableDosages?: number[];
  instructions?: string;
  warnings?: string;
  isActive: boolean;
  createdBy: Id<"users">;
  updatedBy?: Id<"users">;
  createdAt: number;
  updatedAt?: number;
};

type ConvexLabCatalogItem = {
  _id: Id<"labCatalog">;
  _creationTime: number;
  name: string;
  code?: string;
  category: string;
  description?: string;
  normalRange?: string;
  units?: string;
  preparation?: string;
  isActive: boolean;
  createdBy: Id<"users">;
  updatedBy?: Id<"users">;
  createdAt: number;
  updatedAt?: number;
};

function transformMedicationCatalogItem(
  doc: ConvexMedicationCatalogItem
): MedicationCatalogItem {
  return {
    id: doc._id as string,
    name: doc.name,
    genericName: doc.genericName,
    category: doc.category as MedicationCategory,
    dosage: doc.dosage,
    dosageUnit: doc.dosageUnit as MedicationCatalogItem["dosageUnit"],
    availableUnits: doc.availableUnits,
    availableDosages: doc.availableDosages,
    instructions: doc.instructions,
    warnings: doc.warnings,
    isActive: doc.isActive,
    createdAt: new Date(doc.createdAt),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

function transformLabCatalogItem(doc: ConvexLabCatalogItem): LabCatalogItem {
  return {
    id: doc._id as string,
    name: doc.name,
    code: doc.code,
    category: doc.category as LabCategory,
    description: doc.description,
    normalRange: doc.normalRange,
    units: doc.units,
    preparation: doc.preparation,
    isActive: doc.isActive,
    createdAt: new Date(doc.createdAt),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

// ============================================================================
// Medication Catalog Hooks
// ============================================================================

/**
 * List active medications from the catalog.
 * Optionally filter by category or search query.
 */
export function useMedicationCatalog(options?: {
  limit?: number;
  category?: MedicationCategory;
  searchQuery?: string;
}) {
  const result = useQuery(api.catalog.listMedications, {
    limit: options?.limit,
    category: options?.category,
    searchQuery: options?.searchQuery,
  });

  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) =>
      transformMedicationCatalogItem(doc as ConvexMedicationCatalogItem)
    );
  }, [result]);
}

/**
 * Search medications in the catalog using full-text search.
 */
export function useSearchMedicationCatalog(
  query: string,
  options?: { limit?: number }
) {
  const result = useQuery(
    api.catalog.searchMedications,
    query.trim() ? { query, limit: options?.limit } : "skip"
  );

  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) =>
      transformMedicationCatalogItem(doc as ConvexMedicationCatalogItem)
    );
  }, [result]);
}

/**
 * Get a single medication from the catalog by ID.
 */
export function useMedicationCatalogItem(id: string | undefined) {
  const result = useQuery(
    api.catalog.getMedication,
    id ? { id: id as Id<"medicationCatalog"> } : "skip"
  );

  return useMemo(() => {
    if (result === undefined) return undefined;
    if (result === null) return null;
    return transformMedicationCatalogItem(result as ConvexMedicationCatalogItem);
  }, [result]);
}

/**
 * Get all medication categories with their item counts.
 */
export function useMedicationCategories() {
  const result = useQuery(api.catalog.getMedicationCategories, {});

  return useMemo(() => {
    if (result === undefined) return undefined;
    return result as CategoryWithCount[];
  }, [result]);
}

// ============================================================================
// Lab Catalog Hooks
// ============================================================================

/**
 * List active lab tests from the catalog.
 * Optionally filter by category or search query.
 */
export function useLabCatalog(options?: {
  limit?: number;
  category?: LabCategory;
  searchQuery?: string;
}) {
  const result = useQuery(api.catalog.listLabs, {
    limit: options?.limit,
    category: options?.category,
    searchQuery: options?.searchQuery,
  });

  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) =>
      transformLabCatalogItem(doc as ConvexLabCatalogItem)
    );
  }, [result]);
}

/**
 * Search lab tests in the catalog using full-text search.
 */
export function useSearchLabCatalog(query: string, options?: { limit?: number }) {
  const result = useQuery(
    api.catalog.searchLabs,
    query.trim() ? { query, limit: options?.limit } : "skip"
  );

  return useMemo(() => {
    if (result === undefined) return undefined;
    return result.map((doc) =>
      transformLabCatalogItem(doc as ConvexLabCatalogItem)
    );
  }, [result]);
}

/**
 * Get a single lab test from the catalog by ID.
 */
export function useLabCatalogItem(id: string | undefined) {
  const result = useQuery(
    api.catalog.getLab,
    id ? { id: id as Id<"labCatalog"> } : "skip"
  );

  return useMemo(() => {
    if (result === undefined) return undefined;
    if (result === null) return null;
    return transformLabCatalogItem(result as ConvexLabCatalogItem);
  }, [result]);
}

/**
 * Get all lab categories with their item counts.
 */
export function useLabCategories() {
  const result = useQuery(api.catalog.getLabCategories, {});

  return useMemo(() => {
    if (result === undefined) return undefined;
    return result as CategoryWithCount[];
  }, [result]);
}
