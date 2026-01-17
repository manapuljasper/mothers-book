import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireDoctor } from "./lib/auth";

// Get invitation by token
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookletInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});

// Get invitations by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookletInvitations")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .collect();
  },
});

// Get invitations by booklet
export const getByBooklet = query({
  args: { bookletId: v.id("booklets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookletInvitations")
      .withIndex("by_booklet", (q) => q.eq("bookletId", args.bookletId))
      .collect();
  },
});

// Create invitation (internal - called after booklet creation)
export const createInvitation = internalMutation({
  args: {
    bookletId: v.id("booklets"),
    email: v.string(),
    doctorId: v.id("doctorProfiles"),
    tempPassword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate a unique token
    const token = generateToken();

    // Set expiration to 30 days from now
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    const invitationId = await ctx.db.insert("bookletInvitations", {
      bookletId: args.bookletId,
      email: args.email.toLowerCase(),
      token,
      status: "pending",
      createdByDoctorId: args.doctorId,
      expiresAt,
      tempPassword: args.tempPassword,
    });

    return await ctx.db.get(invitationId);
  },
});

// Accept invitation
export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("bookletInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation already used or expired");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    await ctx.db.patch(invitation._id, { status: "accepted" });

    return { success: true, bookletId: invitation.bookletId };
  },
});

// Expire old invitations (can be called by a scheduled job)
export const expireOldInvitations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pendingInvitations = await ctx.db
      .query("bookletInvitations")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    let expiredCount = 0;
    for (const invitation of pendingInvitations) {
      if (invitation.expiresAt < now) {
        await ctx.db.patch(invitation._id, { status: "expired" });
        expiredCount++;
      }
    }

    return { expiredCount };
  },
});

// Generate a random token
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
