import { internalMutation } from "../_generated/server";

/**
 * One-time migration to backfill `role` field for existing users.
 * - If user has doctorProfile → set role = "doctor"
 * - If user has motherProfile → set role = "mother"
 * - If user has both → default to "doctor" (edge case)
 */
export const backfillUserRoles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    let updated = 0;
    let skipped = 0;
    let doctors = 0;
    let mothers = 0;

    for (const user of users) {
      // Skip if already has a role
      if (user.role) {
        skipped++;
        continue;
      }

      // Check for profiles
      const [doctorProfile, motherProfile] = await Promise.all([
        ctx.db
          .query("doctorProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first(),
        ctx.db
          .query("motherProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first(),
      ]);

      let role: "doctor" | "mother" | null = null;

      if (doctorProfile && motherProfile) {
        // Edge case: has both profiles, default to doctor
        role = "doctor";
        console.log(`User ${user._id} has both profiles, defaulting to doctor`);
      } else if (doctorProfile) {
        role = "doctor";
        doctors++;
      } else if (motherProfile) {
        role = "mother";
        mothers++;
      }

      if (role) {
        await ctx.db.patch(user._id, { role });
        updated++;
      }
    }

    return {
      total: users.length,
      updated,
      skipped,
      doctors,
      mothers,
    };
  },
});
