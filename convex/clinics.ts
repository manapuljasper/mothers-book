import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================================
// QUERIES
// ============================================================================

// Get all clinics for a doctor
export const getByDoctor = query({
  args: { doctorId: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("doctorClinics")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();
  },
});

// Get primary clinic for a doctor
export const getPrimaryByDoctor = query({
  args: { doctorId: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    const clinics = await ctx.db
      .query("doctorClinics")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();
    return clinics.find((c) => c.isPrimary) || clinics[0] || null;
  },
});

// Get a single clinic by ID
export const getById = query({
  args: { clinicId: v.id("doctorClinics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clinicId);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

// Schedule item validator
const scheduleItemValidator = v.object({
  days: v.string(),
  startTime: v.string(),
  endTime: v.string(),
});

// Create a new clinic
export const create = mutation({
  args: {
    doctorId: v.id("doctorProfiles"),
    name: v.string(),
    address: v.string(),
    contactNumber: v.optional(v.string()),
    googleMapsLink: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    schedule: v.optional(v.array(scheduleItemValidator)),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify the doctor profile belongs to this user
    const doctorProfile = await ctx.db.get(args.doctorId);
    if (!doctorProfile || doctorProfile.userId !== userId) {
      throw new Error("Not authorized");
    }

    // Check existing clinics
    const existingClinics = await ctx.db
      .query("doctorClinics")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();

    // If this is the first clinic or marked as primary, handle primary status
    let isPrimary = args.isPrimary ?? existingClinics.length === 0;

    // If setting as primary, unset other primaries
    if (isPrimary) {
      for (const clinic of existingClinics) {
        if (clinic.isPrimary) {
          await ctx.db.patch(clinic._id, { isPrimary: false });
        }
      }
    }

    return await ctx.db.insert("doctorClinics", {
      doctorId: args.doctorId,
      name: args.name,
      address: args.address,
      contactNumber: args.contactNumber,
      googleMapsLink: args.googleMapsLink,
      latitude: args.latitude,
      longitude: args.longitude,
      schedule: args.schedule,
      isPrimary,
      createdAt: Date.now(),
    });
  },
});

// Update an existing clinic
export const update = mutation({
  args: {
    clinicId: v.id("doctorClinics"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    googleMapsLink: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    schedule: v.optional(v.array(scheduleItemValidator)),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clinic = await ctx.db.get(args.clinicId);
    if (!clinic) throw new Error("Clinic not found");

    // Verify ownership
    const doctorProfile = await ctx.db.get(clinic.doctorId);
    if (!doctorProfile || doctorProfile.userId !== userId) {
      throw new Error("Not authorized");
    }

    const { clinicId, isPrimary, ...updates } = args;

    // Handle primary status change
    if (isPrimary === true && !clinic.isPrimary) {
      // Unset other primaries
      const otherClinics = await ctx.db
        .query("doctorClinics")
        .withIndex("by_doctor", (q) => q.eq("doctorId", clinic.doctorId))
        .collect();

      for (const other of otherClinics) {
        if (other._id !== clinicId && other.isPrimary) {
          await ctx.db.patch(other._id, { isPrimary: false });
        }
      }
    }

    // Filter out undefined values
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    if (isPrimary !== undefined) {
      filteredUpdates.isPrimary = isPrimary;
    }

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(clinicId, filteredUpdates);
    }

    return await ctx.db.get(clinicId);
  },
});

// Delete a clinic
export const remove = mutation({
  args: { clinicId: v.id("doctorClinics") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clinic = await ctx.db.get(args.clinicId);
    if (!clinic) throw new Error("Clinic not found");

    // Verify ownership
    const doctorProfile = await ctx.db.get(clinic.doctorId);
    if (!doctorProfile || doctorProfile.userId !== userId) {
      throw new Error("Not authorized");
    }

    const wasPrimary = clinic.isPrimary;
    await ctx.db.delete(args.clinicId);

    // If deleted clinic was primary, make another one primary
    if (wasPrimary) {
      const remainingClinics = await ctx.db
        .query("doctorClinics")
        .withIndex("by_doctor", (q) => q.eq("doctorId", clinic.doctorId))
        .collect();

      if (remainingClinics.length > 0) {
        await ctx.db.patch(remainingClinics[0]._id, { isPrimary: true });
      }
    }

    return { success: true };
  },
});

// Set a clinic as primary
export const setPrimary = mutation({
  args: { clinicId: v.id("doctorClinics") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clinic = await ctx.db.get(args.clinicId);
    if (!clinic) throw new Error("Clinic not found");

    // Verify ownership
    const doctorProfile = await ctx.db.get(clinic.doctorId);
    if (!doctorProfile || doctorProfile.userId !== userId) {
      throw new Error("Not authorized");
    }

    // Unset other primaries
    const allClinics = await ctx.db
      .query("doctorClinics")
      .withIndex("by_doctor", (q) => q.eq("doctorId", clinic.doctorId))
      .collect();

    for (const other of allClinics) {
      if (other._id !== args.clinicId && other.isPrimary) {
        await ctx.db.patch(other._id, { isPrimary: false });
      }
    }

    await ctx.db.patch(args.clinicId, { isPrimary: true });

    return await ctx.db.get(args.clinicId);
  },
});
