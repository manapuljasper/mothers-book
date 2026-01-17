import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "../../stores";

/**
 * Get current authenticated user with profiles
 */
export function useCurrentUser() {
  return useQuery(api.users.getCurrentUser, {});
}

/**
 * Sign in with email/password
 */
export function useSignIn() {
  const { signIn } = useAuthActions();

  return async ({ email, password }: { email: string; password: string }) => {
    await signIn("password", { email, password, flow: "signIn" });
  };
}

/**
 * Sign up with email/password/name
 */
export function useSignUp() {
  const { signIn } = useAuthActions();

  return async ({
    email,
    password,
    fullName,
  }: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    await signIn("password", {
      email,
      password,
      name: fullName,
      flow: "signUp",
    });
  };
}

/**
 * Sign out and clear role
 */
export function useSignOut() {
  const { signOut } = useAuthActions();
  const clearRole = useAuthStore((s) => s.clearRole);

  return async () => {
    clearRole();
    await signOut();
  };
}
