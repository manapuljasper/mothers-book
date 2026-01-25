import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUserId } from "./lib/auth";
import { Doc } from "./_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

// Get current authenticated user with all profiles
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
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

// Check if email exists and get its role
export const getUserRoleByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
    return user ? { exists: true, role: user.role } : { exists: false, role: null };
  },
});

// ============================================================================
// USER SYNC (Clerk -> Convex)
// ============================================================================

// Create or get user from Clerk identity
export const createOrGetUser = mutation({
  args: {
    role: v.optional(v.union(v.literal("doctor"), v.literal("mother"))),
  },
  handler: async (ctx, { role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) {
      // If trying to set a different role, throw error
      if (role && existing.role && existing.role !== role) {
        throw new Error(
          `This account is registered as a ${existing.role}. Please use the correct app.`
        );
      }
      // If existing user has no role and we're providing one, update it
      if (role && !existing.role) {
        await ctx.db.patch(existing._id, { role });
      }
      return existing._id;
    }

    // For new users, role is required
    if (!role) {
      throw new Error("Role is required for new users");
    }

    // Create new user with role
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email,
      fullName: identity.name,
      role,
    });
  },
});

// ============================================================================
// PROFILE CREATION
// ============================================================================

// Create doctor profile for current user
export const createDoctorProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user role
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role && user.role !== "doctor") {
      throw new Error("This account is not registered as a healthcare provider");
    }

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
  args: {
    birthdate: v.number(), // Required - collected during signup
  },
  handler: async (ctx, { birthdate }) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user role
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role && user.role !== "mother") {
      throw new Error("This account is not registered as a patient");
    }

    // Check if already exists
    const existing = await ctx.db
      .query("motherProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("motherProfiles", {
      userId,
      birthdate,
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
    const userId = await getCurrentUserId(ctx);
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

// Clear the requiresPasswordChange flag (called after password change)
export const clearPasswordChangeFlag = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.requiresPasswordChange) {
      await ctx.db.patch(userId, { requiresPasswordChange: false });
    }

    return { success: true };
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
    const userId = await getCurrentUserId(ctx);
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
