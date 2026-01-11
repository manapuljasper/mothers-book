/**
 * Auth Convex Hooks
 *
 * Hooks for authentication operations using Convex Auth.
 * These hooks call Convex auth functions directly.
 */

import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import type { UserRole } from "../../types";

/**
 * Hook to get current user from Convex
 * Returns undefined while loading, null if not authenticated, or user data
 */
export function useCurrentUser() {
  return useQuery(api.users.getCurrentUser, {});
}

/**
 * Sign in hook - returns async function directly
 */
export function useSignIn() {
  const { signIn } = useAuthActions();

  return async ({ email, password }: { email: string; password: string }) => {
    await signIn("password", { email, password, flow: "signIn" });
  };
}

/**
 * Sign up hook - returns async function directly
 * Signs up with Convex Auth, then creates the user record with role and profile
 */
export function useSignUp() {
  const { signIn } = useAuthActions();
  const createUser = useMutation(api.users.createUserAfterAuth);

  return async ({
    email,
    password,
    role,
    fullName,
  }: {
    email: string;
    password: string;
    role: UserRole;
    fullName: string;
  }) => {
    // First, sign up with Convex Auth to create auth record
    await signIn("password", { email, password, flow: "signUp" });

    // Then create the user record with role and profile
    await createUser({ email, role, fullName });
  };
}

/**
 * Sign out hook - returns async function directly
 */
export function useSignOut() {
  const { signOut } = useAuthActions();

  return async () => {
    await signOut();
  };
}
