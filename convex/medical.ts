import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  entryTypeValidator,
  labStatusValidator,
  vitalsValidator,
} from "./lib/validators";

// ========== Medical Entries ==========

// List entries by booklet with doctor info
export const listEntriesByBooklet = query({
  args: { bookletId: v.id("booklets") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("medicalEntries")
      .withIndex("by_booklet", (q) => q.eq("bookletId", args.bookletId))
      .order("desc")
      .collect();

    // Fetch doctor info for each entry
    const entriesWithDoctor = await Promise.all(
      entries.map(async (entry) => {
        const doctorProfile = await ctx.db.get(entry.doctorId);
        const user = doctorProfile
          ? await ctx.db.get(doctorProfile.userId)
          : null;

        return {
          ...entry,
          doctorName: user?.fullName || "Unknown",
          doctorSpecialization: doctorProfile?.specialization,
        };
      })
    );

    return entriesWithDoctor;
  },
});

// Get entry by ID
export const getEntryById = query({
  args: { id: v.id("medicalEntries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create medical entry
export const createEntry = mutation({
  args: {
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
    entryType: entryTypeValidator,
    visitDate: v.number(),
    notes: v.string(),
    vitals: v.optional(vitalsValidator),
    diagnosis: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const entryId = await ctx.db.insert("medicalEntries", {
      bookletId: args.bookletId,
      doctorId: args.doctorId,
      entryType: args.entryType,
      visitDate: args.visitDate,
      notes: args.notes,
      vitals: args.vitals,
      diagnosis: args.diagnosis,
      recommendations: args.recommendations,
      followUpDate: args.followUpDate,
      attachments: args.attachments,
    });

    return await ctx.db.get(entryId);
  },
});

// Update medical entry
export const updateEntry = mutation({
  args: {
    id: v.id("medicalEntries"),
    entryType: v.optional(entryTypeValidator),
    visitDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    vitals: v.optional(vitalsValidator),
    diagnosis: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(id, filteredUpdates);
    }

    return await ctx.db.get(id);
  },
});

// ========== Lab Requests ==========

// List labs by booklet
export const listLabsByBooklet = query({
  args: { bookletId: v.id("booklets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labRequests")
      .withIndex("by_booklet", (q) => q.eq("bookletId", args.bookletId))
      .order("desc")
      .collect();
  },
});

// List labs by medical entry
export const listLabsByEntry = query({
  args: { entryId: v.id("medicalEntries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labRequests")
      .withIndex("by_entry", (q) => q.eq("medicalEntryId", args.entryId))
      .order("desc")
      .collect();
  },
});

// List pending labs (optionally filtered by booklet)
export const listPendingLabs = query({
  args: { bookletId: v.optional(v.id("booklets")) },
  handler: async (ctx, args) => {
    if (args.bookletId) {
      // Use compound index for booklet + status
      const labs = await ctx.db
        .query("labRequests")
        .withIndex("by_booklet_status", (q) =>
          q.eq("bookletId", args.bookletId).eq("status", "pending")
        )
        .order("desc")
        .collect();
      return labs;
    }

    // Get all pending labs
    return await ctx.db
      .query("labRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

// Create lab request
export const createLab = mutation({
  args: {
    bookletId: v.id("booklets"),
    medicalEntryId: v.optional(v.id("medicalEntries")),
    description: v.string(),
    status: labStatusValidator,
    requestedDate: v.number(),
    completedDate: v.optional(v.number()),
    results: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const labId = await ctx.db.insert("labRequests", {
      bookletId: args.bookletId,
      medicalEntryId: args.medicalEntryId,
      description: args.description,
      status: args.status,
      requestedDate: args.requestedDate,
      completedDate: args.completedDate,
      results: args.results,
      notes: args.notes,
    });

    return await ctx.db.get(labId);
  },
});

// Update lab status
export const updateLabStatus = mutation({
  args: {
    id: v.id("labRequests"),
    status: labStatusValidator,
    results: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const updates: Record<string, unknown> = { status: args.status };

    if (args.results !== undefined) {
      updates.results = args.results;
    }

    if (args.status === "completed") {
      updates.completedDate = Date.now();
    }

    await ctx.db.patch(args.id, updates);

    return await ctx.db.get(args.id);
  },
});

// Delete lab request
export const deleteLab = mutation({
  args: { id: v.id("labRequests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});
