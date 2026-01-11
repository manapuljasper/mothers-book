import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { QR_EXPIRY_MINUTES } from "./lib/validators";

// Create a QR token for booklet access
export const create = mutation({
  args: {
    bookletId: v.id("booklets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const expiresAt = Date.now() + QR_EXPIRY_MINUTES * 60 * 1000;

    const tokenId = await ctx.db.insert("qrTokens", {
      bookletId: args.bookletId,
      expiresAt,
    });

    return await ctx.db.get(tokenId);
  },
});

// Get token by ID
export const getById = query({
  args: { id: v.id("qrTokens") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Use a QR token (grants access to doctor)
export const useToken = mutation({
  args: {
    tokenId: v.id("qrTokens"),
    doctorId: v.id("doctorProfiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const token = await ctx.db.get(args.tokenId);
    if (!token) {
      throw new Error("Token not found");
    }

    // Check if token is expired
    if (token.expiresAt < Date.now()) {
      throw new Error("Token has expired");
    }

    // Check if token is already used
    if (token.usedAt) {
      throw new Error("Token has already been used");
    }

    // Mark token as used
    await ctx.db.patch(args.tokenId, {
      usedAt: Date.now(),
      usedByDoctorId: args.doctorId,
    });

    // Grant access to the booklet
    const existingAccess = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet_doctor", (q) =>
        q.eq("bookletId", token.bookletId).eq("doctorId", args.doctorId)
      )
      .collect();

    const activeAccess = existingAccess.find((a) => !a.revokedAt);

    if (!activeAccess) {
      await ctx.db.insert("bookletAccess", {
        bookletId: token.bookletId,
        doctorId: args.doctorId,
        grantedAt: Date.now(),
      });
    }

    return { success: true, bookletId: token.bookletId };
  },
});

// Clean up expired tokens (can be called by a scheduled function)
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all expired, unused tokens
    const expiredTokens = await ctx.db
      .query("qrTokens")
      .withIndex("by_expires")
      .collect();

    const tokensToDelete = expiredTokens.filter(
      (t) => t.expiresAt < now && !t.usedAt
    );

    for (const token of tokensToDelete) {
      await ctx.db.delete(token._id);
    }

    return { deleted: tokensToDelete.length };
  },
});
