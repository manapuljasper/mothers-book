import { v } from "convex/values";
import { query } from "./_generated/server";

// Get mother profile by ID
export const getById = query({
  args: { id: v.id("motherProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
