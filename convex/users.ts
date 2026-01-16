import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

// Get current authenticated user with all profiles
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const [doctorProfile, motherProfile, superAdminProfile] = await Promise.all([
      ctx.db
        .query("doctorProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("motherProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("superAdminProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first(),
    ]);

    return { user, doctorProfile, motherProfile, superAdminProfile };
  },
});

// Get user by ID
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ============================================================================
// PROFILE CREATION
// ============================================================================

// Create doctor profile for current user
export const createDoctorProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already exists
    const existing = await ctx.db
      .query("doctorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("doctorProfiles", {
      userId,
      prcNumber: "",
      contactNumber: "",
    });
  },
});

// Create mother profile for current user
export const createMotherProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already exists
    const existing = await ctx.db
      .query("motherProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("motherProfiles", {
      userId,
      birthdate: Date.now(),
    });
  },
});

// ============================================================================
// PROFILE UPDATES
// ============================================================================

// Update doctor profile (personal info only, clinics are managed separately)
export const updateDoctorProfile = mutation({
  args: {
    doctorId: v.id("doctorProfiles"),
    fullName: v.optional(v.string()),
    prcNumber: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    specialization: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { doctorId, fullName, ...profileUpdates } = args;

    const doctorProfile = await ctx.db.get(doctorId);
    if (!doctorProfile) throw new Error("Profile not found");

    // Update user's full name if provided
    if (fullName) {
      await ctx.db.patch(doctorProfile.userId, { fullName });
    }

    // Filter out undefined values and update profile
    const updates: Partial<Doc<"doctorProfiles">> = {};
    for (const [key, value] of Object.entries(profileUpdates)) {
      if (value !== undefined) {
        (updates as Record<string, unknown>)[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(doctorId, updates);
    }

    return await ctx.db.get(doctorId);
  },
});

// Update mother profile
export const updateMotherProfile = mutation({
  args: {
    motherId: v.id("motherProfiles"),
    fullName: v.optional(v.string()),
    birthdate: v.optional(v.number()),
    contactNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    babyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { motherId, fullName, ...profileUpdates } = args;

    const motherProfile = await ctx.db.get(motherId);
    if (!motherProfile) throw new Error("Profile not found");

    // Update user's full name if provided
    if (fullName) {
      await ctx.db.patch(motherProfile.userId, { fullName });
    }

    // Filter out undefined values and update profile
    const updates: Partial<Doc<"motherProfiles">> = {};
    for (const [key, value] of Object.entries(profileUpdates)) {
      if (value !== undefined) {
        (updates as Record<string, unknown>)[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(motherId, updates);
    }

    return await ctx.db.get(motherId);
  },
});
