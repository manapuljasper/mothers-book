import { v } from "convex/values";
import { query } from "./_generated/server";
import { medicationCategories, labCategories } from "./lib/validators";

// ============================================================================
// MEDICATION CATALOG (Public Read Access)
// ============================================================================

/**
 * List active medications from the catalog.
 * Accessible by any authenticated user (doctors can use this when prescribing).
 */
export const listMedications = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let medications;

    if (args.category) {
      medications = await ctx.db
        .query("medicationCatalog")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .order("asc")
        .take(limit);
    } else {
      medications = await ctx.db
        .query("medicationCatalog")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .order("asc")
        .take(limit);
    }

    // Apply search filter if provided
    if (args.searchQuery) {
      const search = args.searchQuery.toLowerCase();
      medications = medications.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.genericName.toLowerCase().includes(search)
      );
    }

    return medications;
  },
});

/**
 * Search medications by name using full-text search.
 */
export const searchMedications = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return [];
    }

    const limit = args.limit ?? 20;

    const results = await ctx.db
      .query("medicationCatalog")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(limit);

    return results;
  },
});

/**
 * Get a single medication from the catalog.
 */
export const getMedication = query({
  args: { id: v.id("medicationCatalog") },
  handler: async (ctx, args) => {
    const medication = await ctx.db.get(args.id);
    if (!medication || !medication.isActive) {
      return null;
    }
    return medication;
  },
});

/**
 * Get all medication categories with counts.
 */
export const getMedicationCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await Promise.all(
      medicationCategories.map(async (category) => {
        const count = await ctx.db
          .query("medicationCatalog")
          .withIndex("by_category", (q) => q.eq("category", category))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()
          .then((items) => items.length);

        return { category, count };
      })
    );

    return categories.filter((c) => c.count > 0);
  },
});

// ============================================================================
// LAB CATALOG (Public Read Access)
// ============================================================================

/**
 * List active lab tests from the catalog.
 * Accessible by any authenticated user (doctors can use this when ordering labs).
 */
export const listLabs = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let labs;

    if (args.category) {
      labs = await ctx.db
        .query("labCatalog")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .order("asc")
        .take(limit);
    } else {
      labs = await ctx.db
        .query("labCatalog")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .order("asc")
        .take(limit);
    }

    // Apply search filter if provided
    if (args.searchQuery) {
      const search = args.searchQuery.toLowerCase();
      labs = labs.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.code?.toLowerCase().includes(search) ||
          l.description?.toLowerCase().includes(search)
      );
    }

    return labs;
  },
});

/**
 * Search lab tests by name using full-text search.
 */
export const searchLabs = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return [];
    }

    const limit = args.limit ?? 20;

    const results = await ctx.db
      .query("labCatalog")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(limit);

    return results;
  },
});

/**
 * Get a single lab test from the catalog.
 */
export const getLab = query({
  args: { id: v.id("labCatalog") },
  handler: async (ctx, args) => {
    const lab = await ctx.db.get(args.id);
    if (!lab || !lab.isActive) {
      return null;
    }
    return lab;
  },
});

/**
 * Get all lab categories with counts.
 */
export const getLabCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await Promise.all(
      labCategories.map(async (category) => {
        const count = await ctx.db
          .query("labCatalog")
          .withIndex("by_category", (q) => q.eq("category", category))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()
          .then((items) => items.length);

        return { category, count };
      })
    );

    return categories.filter((c) => c.count > 0);
  },
});
