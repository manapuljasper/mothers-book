import { QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";
import { UserRole } from "./validators";

/**
 * Get the current user's role based on their profiles
 * Priority: super_admin > doctor > mother
 */
export async function getUserRole(
  ctx: QueryCtx | MutationCtx
): Promise<UserRole | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  // Check for super admin profile first
  const superAdminProfile = await ctx.db
    .query("superAdminProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (superAdminProfile) return "super_admin";

  // Check for doctor profile
  const doctorProfile = await ctx.db
    .query("doctorProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (doctorProfile) return "doctor";

  // Check for mother profile
  const motherProfile = await ctx.db
    .query("motherProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (motherProfile) return "mother";

  return null;
}

/**
 * Require the user to be a super admin
 * Throws an error if not authenticated or not a super admin
 */
export async function requireSuperAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const superAdminProfile = await ctx.db
    .query("superAdminProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!superAdminProfile) {
    throw new Error("Access denied: Super Admin required");
  }

  return { userId, superAdminProfile };
}

/**
 * Require the user to be a doctor
 * Throws an error if not authenticated or not a doctor
 */
export async function requireDoctor(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const doctorProfile = await ctx.db
    .query("doctorProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!doctorProfile) {
    throw new Error("Access denied: Doctor required");
  }

  return { userId, doctorProfile };
}

/**
 * Require the user to be a mother
 * Throws an error if not authenticated or not a mother
 */
export async function requireMother(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const motherProfile = await ctx.db
    .query("motherProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!motherProfile) {
    throw new Error("Access denied: Mother required");
  }

  return { userId, motherProfile };
}

/**
 * Check if a super admin has a specific permission
 */
export function hasPermission(
  permissions: string[],
  requiredPermission: string
): boolean {
  return permissions.includes(requiredPermission);
}
