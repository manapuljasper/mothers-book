import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Get authenticated user from Clerk JWT
 * Returns the internal Convex user document or null if not authenticated
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // identity.subject is the Clerk user ID
  const clerkId = identity.subject;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
}

/**
 * Require authenticated user, throws if not authenticated
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getAuthenticatedUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

/**
 * Get or create user from Clerk identity (for first-time login/signup)
 */
export async function getOrCreateUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const clerkId = identity.subject;

  // Check if user already exists
  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    // Create new user from Clerk identity
    const userId = await ctx.db.insert("users", {
      clerkId,
      email: identity.email,
      fullName: identity.name || "",
    });
    user = await ctx.db.get(userId);
  }

  return user!;
}
