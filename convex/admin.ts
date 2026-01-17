import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireSuperAdmin, getCurrentUserId } from "./lib/auth";

// ============================================================================
// SETUP CHECK
// ============================================================================

export const checkSuperAdminExists = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("superAdminProfiles").first();
    return existing !== null;
  },
});

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

    const [
      totalUsers,
      totalDoctors,
      totalMothers,
      totalBooklets,
      activeBooklets,
      totalMedications,
      activeMedications,
      totalLabRequests,
      pendingLabRequests,
      totalMedicalEntries,
    ] = await Promise.all([
      ctx.db.query("users").collect().then((r) => r.length),
      ctx.db.query("doctorProfiles").collect().then((r) => r.length),
      ctx.db.query("motherProfiles").collect().then((r) => r.length),
      ctx.db.query("booklets").collect().then((r) => r.length),
      ctx.db
        .query("booklets")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect()
        .then((r) => r.length),
      ctx.db.query("medications").collect().then((r) => r.length),
      ctx.db
        .query("medications")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect()
        .then((r) => r.length),
      ctx.db.query("labRequests").collect().then((r) => r.length),
      ctx.db
        .query("labRequests")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect()
        .then((r) => r.length),
      ctx.db.query("medicalEntries").collect().then((r) => r.length),
    ]);

    return {
      users: {
        total: totalUsers,
        doctors: totalDoctors,
        mothers: totalMothers,
      },
      booklets: {
        total: totalBooklets,
        active: activeBooklets,
      },
      medications: {
        total: totalMedications,
        active: activeMedications,
      },
      labRequests: {
        total: totalLabRequests,
        pending: pendingLabRequests,
      },
      medicalEntries: {
        total: totalMedicalEntries,
      },
    };
  },
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    roleFilter: v.optional(v.union(v.literal("doctor"), v.literal("mother"), v.literal("all"))),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const limit = args.limit ?? 50;
    let users = await ctx.db.query("users").order("desc").take(limit + 1);

    // Apply search filter if provided
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      users = users.filter(
        (u) =>
          u.email?.toLowerCase().includes(query) ||
          u.fullName?.toLowerCase().includes(query) ||
          u.name?.toLowerCase().includes(query)
      );
    }

    // Enrich with profile info
    const enrichedUsers = await Promise.all(
      users.slice(0, limit).map(async (user) => {
        const doctorProfile = await ctx.db
          .query("doctorProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        const motherProfile = await ctx.db
          .query("motherProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        const superAdminProfile = await ctx.db
          .query("superAdminProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        return {
          ...user,
          doctorProfile,
          motherProfile,
          superAdminProfile,
          role: superAdminProfile
            ? "super_admin"
            : doctorProfile
              ? "doctor"
              : motherProfile
                ? "mother"
                : null,
        };
      })
    );

    // Apply role filter
    let filteredUsers = enrichedUsers;
    if (args.roleFilter && args.roleFilter !== "all") {
      filteredUsers = enrichedUsers.filter((u) => u.role === args.roleFilter);
    }

    return {
      users: filteredUsers,
      hasMore: users.length > limit,
    };
  },
});

export const getUserDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const doctorProfile = await ctx.db
      .query("doctorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    const motherProfile = await ctx.db
      .query("motherProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    const superAdminProfile = await ctx.db
      .query("superAdminProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Get related data based on role
    let booklets = null;
    let medicalEntries = null;

    if (motherProfile) {
      booklets = await ctx.db
        .query("booklets")
        .withIndex("by_mother", (q) => q.eq("motherId", motherProfile._id))
        .collect();
    }

    if (doctorProfile) {
      medicalEntries = await ctx.db
        .query("medicalEntries")
        .withIndex("by_doctor", (q) => q.eq("doctorId", doctorProfile._id))
        .take(10);
    }

    return {
      user,
      doctorProfile,
      motherProfile,
      superAdminProfile,
      booklets,
      medicalEntries,
    };
  },
});

// ============================================================================
// MEDICATION CATALOG
// ============================================================================

export const listMedicationCatalog = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const limit = args.limit ?? 100;
    let medications;

    if (args.category) {
      medications = await ctx.db
        .query("medicationCatalog")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(limit);
    } else if (args.activeOnly) {
      medications = await ctx.db
        .query("medicationCatalog")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .order("desc")
        .take(limit);
    } else {
      medications = await ctx.db
        .query("medicationCatalog")
        .order("desc")
        .take(limit);
    }

    // Apply search filter
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

export const getMedicationCatalogItem = query({
  args: { id: v.id("medicationCatalog") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const createMedicationCatalogItem = mutation({
  args: {
    name: v.string(),
    genericName: v.string(),
    category: v.string(),
    dosage: v.optional(v.number()),
    dosageUnit: v.optional(v.string()),
    availableUnits: v.optional(v.array(v.string())),
    availableDosages: v.optional(v.array(v.number())),
    instructions: v.optional(v.string()),
    warnings: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSuperAdmin(ctx);

    return await ctx.db.insert("medicationCatalog", {
      ...args,
      isActive: true,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const updateMedicationCatalogItem = mutation({
  args: {
    id: v.id("medicationCatalog"),
    name: v.optional(v.string()),
    genericName: v.optional(v.string()),
    category: v.optional(v.string()),
    dosage: v.optional(v.number()),
    dosageUnit: v.optional(v.string()),
    availableUnits: v.optional(v.array(v.string())),
    availableDosages: v.optional(v.array(v.number())),
    instructions: v.optional(v.string()),
    warnings: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSuperAdmin(ctx);

    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Medication not found");

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const deleteMedicationCatalogItem = mutation({
  args: { id: v.id("medicationCatalog") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

// ============================================================================
// LAB CATALOG
// ============================================================================

export const listLabCatalog = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const limit = args.limit ?? 100;
    let labs;

    if (args.category) {
      labs = await ctx.db
        .query("labCatalog")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(limit);
    } else if (args.activeOnly) {
      labs = await ctx.db
        .query("labCatalog")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .order("desc")
        .take(limit);
    } else {
      labs = await ctx.db
        .query("labCatalog")
        .order("desc")
        .take(limit);
    }

    // Apply search filter
    if (args.searchQuery) {
      const search = args.searchQuery.toLowerCase();
      labs = labs.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.code?.toLowerCase().includes(search)
      );
    }

    return labs;
  },
});

export const getLabCatalogItem = query({
  args: { id: v.id("labCatalog") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const createLabCatalogItem = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    category: v.string(),
    description: v.optional(v.string()),
    normalRange: v.optional(v.string()),
    units: v.optional(v.string()),
    preparation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSuperAdmin(ctx);

    return await ctx.db.insert("labCatalog", {
      ...args,
      isActive: true,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const updateLabCatalogItem = mutation({
  args: {
    id: v.id("labCatalog"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    normalRange: v.optional(v.string()),
    units: v.optional(v.string()),
    preparation: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSuperAdmin(ctx);

    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Lab test not found");

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const deleteLabCatalogItem = mutation({
  args: { id: v.id("labCatalog") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

// ============================================================================
// SUPER ADMIN PROFILE MANAGEMENT
// ============================================================================

export const createSuperAdminProfile = mutation({
  args: {
    userId: v.id("users"),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // For the first super admin, we need to allow creation without being a super admin
    // After that, only super admins can create other super admins
    const currentUserId = await getCurrentUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const existingSuperAdmins = await ctx.db.query("superAdminProfiles").take(1);

    if (existingSuperAdmins.length > 0) {
      // Super admins exist, require super admin access
      await requireSuperAdmin(ctx);
    }

    // Check if target user already has super admin profile
    const existing = await ctx.db
      .query("superAdminProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      throw new Error("User already has super admin profile");
    }

    return await ctx.db.insert("superAdminProfiles", {
      userId: args.userId,
      permissions: args.permissions,
      createdAt: Date.now(),
    });
  },
});

export const updateSuperAdminPermissions = mutation({
  args: {
    profileId: v.id("superAdminProfiles"),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    await ctx.db.patch(args.profileId, {
      permissions: args.permissions,
    });

    return await ctx.db.get(args.profileId);
  },
});

export const removeSuperAdminProfile = mutation({
  args: { profileId: v.id("superAdminProfiles") },
  handler: async (ctx, args) => {
    const { userId } = await requireSuperAdmin(ctx);

    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Profile not found");

    // Prevent removing your own super admin profile
    if (profile.userId === userId) {
      throw new Error("Cannot remove your own super admin profile");
    }

    await ctx.db.delete(args.profileId);
  },
});
