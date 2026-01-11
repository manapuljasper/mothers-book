import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";
import { userRoleValidator } from "./lib/validators";

// Helper: Get user by token identifier
async function getUserByToken(ctx: QueryCtx, tokenIdentifier: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .first();
}

// Helper: Get user by email
async function getUserByEmail(ctx: QueryCtx, email: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
}

// Helper: Get doctor profile by user ID
async function getDoctorProfileByUser(ctx: QueryCtx, userId: Id<"users">) {
  return await ctx.db
    .query("doctorProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

// Helper: Get mother profile by user ID
async function getMotherProfileByUser(ctx: QueryCtx, userId: Id<"users">) {
  return await ctx.db
    .query("motherProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

// Get current user with profile
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await getUserByToken(ctx, identity.tokenIdentifier);
    if (!user) {
      return null;
    }

    let doctorProfile = null;
    let motherProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await getDoctorProfileByUser(ctx, user._id);
    } else if (user.role === "mother") {
      motherProfile = await getMotherProfileByUser(ctx, user._id);
    }

    return {
      user,
      doctorProfile,
      motherProfile,
    };
  },
});

// Get user by ID
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create user with profile (called during signup)
export const createUser = mutation({
  args: {
    email: v.string(),
    role: userRoleValidator,
    fullName: v.string(),
    tokenIdentifier: v.string(),
    // Doctor-specific fields
    prcNumber: v.optional(v.string()),
    clinicName: v.optional(v.string()),
    clinicAddress: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    specialization: v.optional(v.string()),
    // Mother-specific fields
    birthdate: v.optional(v.number()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    babyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await getUserByEmail(ctx, args.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      role: args.role,
      fullName: args.fullName,
      tokenIdentifier: args.tokenIdentifier,
    });

    // Create role-specific profile
    if (args.role === "doctor") {
      await ctx.db.insert("doctorProfiles", {
        userId,
        prcNumber: args.prcNumber || "",
        clinicName: args.clinicName || "",
        clinicAddress: args.clinicAddress || "",
        contactNumber: args.contactNumber || "",
        specialization: args.specialization,
      });
    } else if (args.role === "mother") {
      await ctx.db.insert("motherProfiles", {
        userId,
        birthdate: args.birthdate || Date.now(),
        contactNumber: args.contactNumber,
        address: args.address,
        emergencyContact: args.emergencyContact,
        emergencyContactName: args.emergencyContactName,
        babyName: args.babyName,
      });
    }

    return userId;
  },
});

// Update doctor profile
export const updateDoctorProfile = mutation({
  args: {
    doctorId: v.id("doctorProfiles"),
    fullName: v.optional(v.string()),
    prcNumber: v.optional(v.string()),
    clinicName: v.optional(v.string()),
    clinicAddress: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    specialization: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    clinicSchedule: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { doctorId, fullName, ...profileUpdates } = args;

    // Get the doctor profile to find the user
    const doctorProfile = await ctx.db.get(doctorId);
    if (!doctorProfile) {
      throw new Error("Doctor profile not found");
    }

    // Update user's full name if provided
    if (fullName) {
      await ctx.db.patch(doctorProfile.userId, { fullName });
    }

    // Filter out undefined values
    const updates: Partial<Doc<"doctorProfiles">> = {};
    for (const [key, value] of Object.entries(profileUpdates)) {
      if (value !== undefined) {
        (updates as Record<string, unknown>)[key] = value;
      }
    }

    // Update doctor profile
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { motherId, fullName, ...profileUpdates } = args;

    // Get the mother profile to find the user
    const motherProfile = await ctx.db.get(motherId);
    if (!motherProfile) {
      throw new Error("Mother profile not found");
    }

    // Update user's full name if provided
    if (fullName) {
      await ctx.db.patch(motherProfile.userId, { fullName });
    }

    // Filter out undefined values
    const updates: Partial<Doc<"motherProfiles">> = {};
    for (const [key, value] of Object.entries(profileUpdates)) {
      if (value !== undefined) {
        (updates as Record<string, unknown>)[key] = value;
      }
    }

    // Update mother profile
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(motherId, updates);
    }

    return await ctx.db.get(motherId);
  },
});

// Store user from auth (called after successful auth)
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await getUserByToken(ctx, identity.tokenIdentifier);
    if (existingUser) {
      return existingUser._id;
    }

    // User doesn't exist yet - they need to complete signup
    return null;
  },
});

// Create user after auth signup (called from client after signUp succeeds)
export const createUserAfterAuth = mutation({
  args: {
    email: v.string(),
    role: userRoleValidator,
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists by token
    const existingByToken = await getUserByToken(ctx, identity.tokenIdentifier);
    if (existingByToken) {
      // User already created, return existing
      return existingByToken._id;
    }

    // Check if user already exists by email
    const existingByEmail = await getUserByEmail(ctx, args.email);
    if (existingByEmail) {
      throw new Error("User with this email already exists");
    }

    // Create user record
    const userId = await ctx.db.insert("users", {
      email: args.email,
      role: args.role,
      fullName: args.fullName,
      tokenIdentifier: identity.tokenIdentifier,
    });

    // Create role-specific profile
    if (args.role === "doctor") {
      await ctx.db.insert("doctorProfiles", {
        userId,
        prcNumber: "",
        clinicName: "",
        clinicAddress: "",
        contactNumber: "",
      });
    } else if (args.role === "mother") {
      await ctx.db.insert("motherProfiles", {
        userId,
        birthdate: Date.now(),
      });
    }

    return userId;
  },
});
