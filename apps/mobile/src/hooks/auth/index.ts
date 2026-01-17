import { useQuery, useMutation } from "convex/react";
import { useAuth as useClerkAuth, useSignIn as useClerkSignIn, useSignUp as useClerkSignUp } from "@clerk/clerk-expo";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "../../stores";
import { useEffect } from "react";

/**
 * Get current authenticated user with profiles
 * Also syncs user to Convex if needed
 */
export function useCurrentUser() {
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const data = useQuery(api.users.getCurrentUser);

  // Sync user to Convex when signed in
  useEffect(() => {
    if (clerkLoaded && isSignedIn && data === null) {
      // User is signed in with Clerk but not in Convex yet
      createOrGetUser();
    }
  }, [clerkLoaded, isSignedIn, data, createOrGetUser]);

  // Return undefined while loading to match existing component behavior
  if (!clerkLoaded) return undefined;
  if (isSignedIn && data === undefined) return undefined;

  return data;
}

/**
 * Sign in with email/password
 */
export function useSignIn() {
  const { signIn, isLoaded, setActive } = useClerkSignIn();

  return async ({ email, password }: { email: string; password: string }) => {
    if (!isLoaded || !signIn) {
      throw new Error("Clerk is not loaded");
    }

    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === "complete") {
      // Set the active session
      await setActive({ session: result.createdSessionId });
      return result;
    }

    throw new Error("Sign in failed");
  };
}

/**
 * Sign up with email/password/name
 */
export function useSignUp() {
  const { signUp, isLoaded, setActive } = useClerkSignUp();

  return async ({
    email,
    password,
    fullName,
  }: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    if (!isLoaded || !signUp) {
      throw new Error("Clerk is not loaded");
    }

    const result = await signUp.create({
      emailAddress: email,
      password,
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ").slice(1).join(" ") || undefined,
    });

    if (result.status === "complete") {
      // Set the active session
      await setActive({ session: result.createdSessionId });
      return result;
    }

    // Handle verification if needed
    if (result.status === "missing_requirements") {
      throw new Error("Additional verification required");
    }

    throw new Error("Sign up failed");
  };
}

/**
 * Sign out and clear role
 */
export function useSignOut() {
  const { signOut } = useClerkAuth();
  const clearRole = useAuthStore((s) => s.clearRole);

  return async () => {
    clearRole();
    await signOut();
  };
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  return { isSignedIn: isSignedIn ?? false, isLoaded };
}
