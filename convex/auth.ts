import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const userId = await ctx.db.insert("users", {
        email: args.profile.email,
        fullName: args.profile.name || "",
      });

      return userId;
    },
  },
});
