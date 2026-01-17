import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Priority validator for labs
const labPriorityValidator = v.union(
  v.literal("routine"),
  v.literal("urgent"),
  v.literal("stat")
);

// ========== Favorites Queries ==========

// List top medication favorites for a doctor (by usage count)
export const listMedicationFavorites = query({
  args: { doctorId: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("doctorFavorites")
      .withIndex("by_doctor_type", (q) =>
        q.eq("doctorId", args.doctorId).eq("itemType", "medication")
      )
      .collect();

    // Sort by usage count (descending) and return top 6
    return favorites
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 6);
  },
});

// List top lab favorites for a doctor (by usage count)
export const listLabFavorites = query({
  args: { doctorId: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("doctorFavorites")
      .withIndex("by_doctor_type", (q) =>
        q.eq("doctorId", args.doctorId).eq("itemType", "lab")
      )
      .collect();

    // Sort by usage count (descending) and return top 6
    return favorites
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 6);
  },
});

// Get all favorites for a doctor (for management)
export const listAllFavorites = query({
  args: { doctorId: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("doctorFavorites")
      .withIndex("by_doctor_type", (q) => q.eq("doctorId", args.doctorId))
      .collect();

    return favorites.sort((a, b) => b.usageCount - a.usageCount);
  },
});

// ========== Favorites Mutations ==========

// Add a new favorite or update existing
export const addToFavorites = mutation({
  args: {
    doctorId: v.id("doctorProfiles"),
    itemType: v.union(v.literal("medication"), v.literal("lab")),
    name: v.string(),
    genericName: v.optional(v.string()),
    // Medication fields
    defaultDosage: v.optional(v.number()),
    defaultDosageUnit: v.optional(v.string()),
    defaultFrequency: v.optional(v.number()),
    defaultInstructions: v.optional(v.string()),
    // Lab fields
    labCode: v.optional(v.string()),
    defaultPriority: v.optional(labPriorityValidator),
    // Whether to save custom defaults
    hasCustomDefaults: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if favorite already exists (same name and type for this doctor)
    const existingFavorites = await ctx.db
      .query("doctorFavorites")
      .withIndex("by_doctor_type", (q) =>
        q.eq("doctorId", args.doctorId).eq("itemType", args.itemType)
      )
      .collect();

    const existing = existingFavorites.find(
      (f) => f.name.toLowerCase() === args.name.toLowerCase()
    );

    if (existing) {
      // Update existing favorite
      await ctx.db.patch(existing._id, {
        genericName: args.genericName ?? existing.genericName,
        defaultDosage: args.defaultDosage ?? existing.defaultDosage,
        defaultDosageUnit: args.defaultDosageUnit ?? existing.defaultDosageUnit,
        defaultFrequency: args.defaultFrequency ?? existing.defaultFrequency,
        defaultInstructions: args.defaultInstructions ?? existing.defaultInstructions,
        labCode: args.labCode ?? existing.labCode,
        defaultPriority: args.defaultPriority ?? existing.defaultPriority,
        hasCustomDefaults: args.hasCustomDefaults ?? existing.hasCustomDefaults,
        lastUsedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new favorite
    const favoriteId = await ctx.db.insert("doctorFavorites", {
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
      usageCount: 1,
      lastUsedAt: Date.now(),
      hasCustomDefaults: args.hasCustomDefaults ?? false,
    });

    return favoriteId;
  },
});

// Increment usage count for a favorite
export const incrementUsage = mutation({
  args: { favoriteId: v.id("doctorFavorites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const favorite = await ctx.db.get(args.favoriteId);
    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await ctx.db.patch(args.favoriteId, {
      usageCount: favorite.usageCount + 1,
      lastUsedAt: Date.now(),
    });

    return { success: true };
  },
});

// Increment usage by name (for when we don't have the favorite ID)
export const incrementUsageByName = mutation({
  args: {
    doctorId: v.id("doctorProfiles"),
    itemType: v.union(v.literal("medication"), v.literal("lab")),
    name: v.string(),
    // Optional fields to auto-create if not exists
    genericName: v.optional(v.string()),
    defaultDosage: v.optional(v.number()),
    defaultDosageUnit: v.optional(v.string()),
    defaultFrequency: v.optional(v.number()),
    defaultInstructions: v.optional(v.string()),
    labCode: v.optional(v.string()),
    defaultPriority: v.optional(labPriorityValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find existing favorite
    const existingFavorites = await ctx.db
      .query("doctorFavorites")
      .withIndex("by_doctor_type", (q) =>
        q.eq("doctorId", args.doctorId).eq("itemType", args.itemType)
      )
      .collect();

    const existing = existingFavorites.find(
      (f) => f.name.toLowerCase() === args.name.toLowerCase()
    );

    if (existing) {
      // Increment usage
      await ctx.db.patch(existing._id, {
        usageCount: existing.usageCount + 1,
        lastUsedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new favorite with initial usage
    const favoriteId = await ctx.db.insert("doctorFavorites", {
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
      usageCount: 1,
      lastUsedAt: Date.now(),
      hasCustomDefaults: false,
    });

    return favoriteId;
  },
});

// Save custom defaults for an existing favorite
export const saveWithCustomDefaults = mutation({
  args: {
    favoriteId: v.id("doctorFavorites"),
    defaultDosage: v.optional(v.number()),
    defaultDosageUnit: v.optional(v.string()),
    defaultFrequency: v.optional(v.number()),
    defaultInstructions: v.optional(v.string()),
    defaultPriority: v.optional(labPriorityValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { favoriteId, ...defaults } = args;

    // Filter out undefined values
    const updates: Record<string, unknown> = { hasCustomDefaults: true };
    for (const [key, value] of Object.entries(defaults)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(favoriteId, updates);

    return { success: true };
  },
});

// Remove a favorite
export const removeFromFavorites = mutation({
  args: { favoriteId: v.id("doctorFavorites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.favoriteId);

    return { success: true };
  },
});
