import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";
import {
  medicationFrequencyValidator,
  intakeStatusValidator,
} from "./lib/validators";

// Helper: Get start of day timestamp
function getStartOfDay(date: Date = new Date()): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Helper: Check if date is today
function isToday(timestamp: number): boolean {
  const today = getStartOfDay();
  const date = getStartOfDay(new Date(timestamp));
  return today === date;
}

// Helper: Calculate adherence rate
function calculateAdherence(
  medication: Doc<"medications">,
  logs: Doc<"medicationIntakeLogs">[],
  days: number = 7
): number {
  const today = getStartOfDay();
  const startDate = today - days * 24 * 60 * 60 * 1000;

  const medStartDate = medication.startDate;
  const effectiveStartDate = medStartDate > startDate ? medStartDate : startDate;

  const daysDiff = Math.ceil((today - effectiveStartDate) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 0) return 100;

  const expectedDoses = daysDiff * medication.frequencyPerDay;

  const takenDoses = logs.filter((l) => {
    return (
      l.status === "taken" &&
      l.scheduledDate >= effectiveStartDate &&
      l.scheduledDate <= today
    );
  }).length;

  return Math.round((takenDoses / expectedDoses) * 100);
}

// Helper: Get medications with logs
async function getMedicationsWithLogs(
  ctx: QueryCtx,
  medications: Doc<"medications">[]
) {
  if (medications.length === 0) return [];

  // Get all intake logs for these medications
  const allLogs = await Promise.all(
    medications.map(async (med) => {
      return await ctx.db
        .query("medicationIntakeLogs")
        .withIndex("by_medication", (q) => q.eq("medicationId", med._id))
        .collect();
    })
  );

  // Flatten logs
  const logsFlat = allLogs.flat();

  // Enrich medications with logs
  return medications.map((med) => {
    const medLogs = logsFlat.filter((l) => l.medicationId === med._id);
    const todayLogs = medLogs.filter((l) => isToday(l.scheduledDate));

    return {
      ...med,
      intakeLogs: medLogs,
      todayLogs,
      adherenceRate: calculateAdherence(med, medLogs),
    };
  });
}

// ========== Queries ==========

// List medications by booklet
export const listByBooklet = query({
  args: { bookletId: v.id("booklets") },
  handler: async (ctx, args) => {
    const medications = await ctx.db
      .query("medications")
      .withIndex("by_booklet", (q) => q.eq("bookletId", args.bookletId))
      .order("desc")
      .collect();

    return await getMedicationsWithLogs(ctx, medications);
  },
});

// List medications by entry
export const listByEntry = query({
  args: { entryId: v.id("medicalEntries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medications")
      .withIndex("by_entry", (q) => q.eq("medicalEntryId", args.entryId))
      .collect();
  },
});

// List active medications
export const listActive = query({
  args: { bookletId: v.optional(v.id("booklets")) },
  handler: async (ctx, args) => {
    let medications: Doc<"medications">[];

    if (args.bookletId) {
      medications = await ctx.db
        .query("medications")
        .withIndex("by_booklet_active", (q) =>
          q.eq("bookletId", args.bookletId).eq("isActive", true)
        )
        .order("desc")
        .collect();
    } else {
      // Get all active medications - need to filter in memory
      const allMeds = await ctx.db.query("medications").collect();
      medications = allMeds.filter((m) => m.isActive);
    }

    return await getMedicationsWithLogs(ctx, medications);
  },
});

// List today's medications (same as active for now)
export const listToday = query({
  args: { bookletId: v.optional(v.id("booklets")) },
  handler: async (ctx, args) => {
    // Same as listActive - returns active medications
    let medications: Doc<"medications">[];

    if (args.bookletId) {
      medications = await ctx.db
        .query("medications")
        .withIndex("by_booklet_active", (q) =>
          q.eq("bookletId", args.bookletId).eq("isActive", true)
        )
        .order("desc")
        .collect();
    } else {
      const allMeds = await ctx.db.query("medications").collect();
      medications = allMeds.filter((m) => m.isActive);
    }

    return await getMedicationsWithLogs(ctx, medications);
  },
});

// Get medication by ID
export const getById = query({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get adherence rate
export const getAdherence = query({
  args: {
    medicationId: v.id("medications"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const medication = await ctx.db.get(args.medicationId);
    if (!medication) return 0;

    const logs = await ctx.db
      .query("medicationIntakeLogs")
      .withIndex("by_medication", (q) => q.eq("medicationId", args.medicationId))
      .collect();

    return calculateAdherence(medication, logs, args.days || 7);
  },
});

// ========== Mutations ==========

// Create medication
export const create = mutation({
  args: {
    bookletId: v.id("booklets"),
    medicalEntryId: v.optional(v.id("medicalEntries")),
    name: v.string(),
    dosage: v.string(),
    instructions: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    frequencyPerDay: medicationFrequencyValidator,
    timesOfDay: v.optional(v.array(v.string())),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const medId = await ctx.db.insert("medications", {
      bookletId: args.bookletId,
      medicalEntryId: args.medicalEntryId,
      name: args.name,
      dosage: args.dosage,
      instructions: args.instructions,
      startDate: args.startDate,
      endDate: args.endDate,
      frequencyPerDay: args.frequencyPerDay,
      timesOfDay: args.timesOfDay,
      isActive: args.isActive,
    });

    return await ctx.db.get(medId);
  },
});

// Update medication
export const update = mutation({
  args: {
    id: v.id("medications"),
    name: v.optional(v.string()),
    dosage: v.optional(v.string()),
    instructions: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    frequencyPerDay: v.optional(medicationFrequencyValidator),
    timesOfDay: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
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

// Deactivate medication
export const deactivate = mutation({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { isActive: false });

    return await ctx.db.get(args.id);
  },
});

// Delete medication (and its intake logs)
export const deleteMedication = mutation({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Delete all intake logs for this medication
    const logs = await ctx.db
      .query("medicationIntakeLogs")
      .withIndex("by_medication", (q) => q.eq("medicationId", args.id))
      .collect();

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    // Delete the medication
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Log medication intake
export const logIntake = mutation({
  args: {
    medicationId: v.id("medications"),
    doseIndex: v.number(),
    status: intakeStatusValidator,
    userId: v.id("users"),
    scheduledDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const scheduledDate = args.scheduledDate || getStartOfDay();

    // Check if log already exists for this dose on this day
    const existingLogs = await ctx.db
      .query("medicationIntakeLogs")
      .withIndex("by_medication_date", (q) =>
        q.eq("medicationId", args.medicationId).eq("scheduledDate", scheduledDate)
      )
      .collect();

    const existing = existingLogs.find((l) => l.doseIndex === args.doseIndex);

    if (existing) {
      // Update existing log
      await ctx.db.patch(existing._id, {
        status: args.status,
        takenAt: args.status === "taken" ? Date.now() : undefined,
      });

      return await ctx.db.get(existing._id);
    }

    // Create new log
    const logId = await ctx.db.insert("medicationIntakeLogs", {
      medicationId: args.medicationId,
      scheduledDate,
      doseIndex: args.doseIndex,
      status: args.status,
      takenAt: args.status === "taken" ? Date.now() : undefined,
      recordedByUserId: args.userId,
    });

    return await ctx.db.get(logId);
  },
});
