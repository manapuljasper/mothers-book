import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { bookletStatusValidator } from "./lib/validators";

// Helper: Get booklet with authorization check
async function getBookletWithAuth(ctx: QueryCtx, bookletId: Id<"booklets">) {
  const booklet = await ctx.db.get(bookletId);
  if (!booklet) {
    throw new Error("Booklet not found");
  }
  return booklet;
}

// Get booklet by ID
export const getById = query({
  args: { id: v.id("booklets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List booklets by mother
export const listByMother = query({
  args: { motherId: v.id("motherProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("booklets")
      .withIndex("by_mother", (q) => q.eq("motherId", args.motherId))
      .order("desc")
      .collect();
  },
});

// List booklets by doctor (with active access)
export const listByDoctor = query({
  args: { doctorId: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    // Get active access records for this doctor
    const accessRecords = await ctx.db
      .query("bookletAccess")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();

    // Filter for active access (no revocation)
    const activeAccess = accessRecords.filter((a) => !a.revokedAt);

    // Fetch booklets with mother info
    const results = await Promise.all(
      activeAccess.map(async (access) => {
        const booklet = await ctx.db.get(access.bookletId);
        if (!booklet) return null;

        // Get mother profile and user info
        const motherProfile = await ctx.db.get(booklet.motherId);
        const user = motherProfile
          ? await ctx.db.get(motherProfile.userId)
          : null;

        // Get latest medical entry for visit/followup dates
        const latestEntry = await ctx.db
          .query("medicalEntries")
          .withIndex("by_booklet", (q) => q.eq("bookletId", booklet._id))
          .order("desc")
          .first();

        return {
          ...booklet,
          motherName: user?.fullName || "Unknown",
          lastVisitDate: latestEntry?.visitDate,
          nextAppointment: latestEntry?.followUpDate,
        };
      })
    );

    return results.filter(Boolean);
  },
});

// Get doctors with access to a booklet
export const getDoctors = query({
  args: { bookletId: v.id("booklets") },
  handler: async (ctx, args) => {
    // Get active access records for this booklet
    const accessRecords = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet", (q) => q.eq("bookletId", args.bookletId))
      .collect();

    // Filter for active access
    const activeAccess = accessRecords.filter((a) => !a.revokedAt);

    // Fetch doctor profiles with user info and primary clinic
    const doctors = await Promise.all(
      activeAccess.map(async (access) => {
        const doctorProfile = await ctx.db.get(access.doctorId);
        if (!doctorProfile) return null;

        const user = await ctx.db.get(doctorProfile.userId);

        // Get primary clinic for this doctor
        const clinics = await ctx.db
          .query("doctorClinics")
          .withIndex("by_doctor", (q) => q.eq("doctorId", doctorProfile._id))
          .collect();
        const primaryClinic = clinics.find((c) => c.isPrimary) || clinics[0];

        return {
          ...doctorProfile,
          fullName: user?.fullName || "Unknown",
          // Include primary clinic name for backward compatibility
          clinicName: primaryClinic?.name || "",
        };
      })
    );

    return doctors.filter(Boolean);
  },
});

// Create booklet
export const create = mutation({
  args: {
    motherId: v.id("motherProfiles"),
    label: v.string(),
    status: bookletStatusValidator,
    expectedDueDate: v.optional(v.number()),
    actualDeliveryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const bookletId = await ctx.db.insert("booklets", {
      motherId: args.motherId,
      label: args.label,
      status: args.status,
      expectedDueDate: args.expectedDueDate,
      actualDeliveryDate: args.actualDeliveryDate,
      notes: args.notes,
    });

    return await ctx.db.get(bookletId);
  },
});

// Update booklet
export const update = mutation({
  args: {
    id: v.id("booklets"),
    label: v.optional(v.string()),
    status: v.optional(bookletStatusValidator),
    expectedDueDate: v.optional(v.number()),
    actualDeliveryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
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

// Grant doctor access to booklet
export const grantAccess = mutation({
  args: {
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if access already exists and is active
    const existingAccess = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet_doctor", (q) =>
        q.eq("bookletId", args.bookletId).eq("doctorId", args.doctorId)
      )
      .collect();

    const activeAccess = existingAccess.find((a) => !a.revokedAt);
    if (activeAccess) {
      return activeAccess;
    }

    // Create new access record
    const accessId = await ctx.db.insert("bookletAccess", {
      bookletId: args.bookletId,
      doctorId: args.doctorId,
      grantedAt: Date.now(),
    });

    return await ctx.db.get(accessId);
  },
});

// Revoke doctor access
export const revokeAccess = mutation({
  args: {
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find active access record
    const accessRecords = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet_doctor", (q) =>
        q.eq("bookletId", args.bookletId).eq("doctorId", args.doctorId)
      )
      .collect();

    const activeAccess = accessRecords.find((a) => !a.revokedAt);
    if (!activeAccess) {
      throw new Error("No active access found");
    }

    // Revoke access
    await ctx.db.patch(activeAccess._id, {
      revokedAt: Date.now(),
    });

    return { success: true };
  },
});
