import { useQuery } from "convex/react";
import {
  useSignIn as useClerkSignIn,
  useSignUp as useClerkSignUp,
  useClerk,
  useAuth,
} from "@clerk/clerk-expo";
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from "../../stores";

/**
 * Get current authenticated user with profiles
 */
export function useCurrentUser() {
  return useQuery(api.users.getCurrentUser, {});
}

/**
 * Check if authenticated (use for conditional rendering)
 */
export function useIsAuthenticated() {
  const { isSignedIn, isLoaded } = useAuth();
  return { isAuthenticated: isSignedIn ?? false, isLoading: !isLoaded };
}

/**
 * Sign in with email/password
 */
export function useSignIn() {
  const { signIn, setActive, isLoaded } = useClerkSignIn();

  return async ({ email, password }: { email: string; password: string }) => {
    if (!isLoaded || !signIn) {
      throw new Error("Sign in not ready");
    }

    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
    } else {
      // Handle other statuses if needed (e.g., needs_first_factor)
      throw new Error("Sign in incomplete. Please try again.");
    }
  };
}

/**
 * Sign up with email/password/name
 */
export function useSignUp() {
  const { signUp, setActive, isLoaded } = useClerkSignUp();

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
      throw new Error("Sign up not ready");
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || undefined;

    const result = await signUp.create({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });

    // If Clerk requires email verification, handle it
    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
    } else if (result.status === "missing_requirements") {
      // Email verification might be required
      // For now, we'll prepare verification but the UI should handle this
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      throw new Error("Please check your email for a verification code.");
    } else {
      throw new Error("Sign up incomplete. Please try again.");
    }
  };
}

/**
 * Sign out and clear role
 */
export function useSignOut() {
  const { signOut } = useClerk();
  const clearRole = useAuthStore((s) => s.clearRole);

  return async () => {
    clearRole();
    await signOut();
  };
}
