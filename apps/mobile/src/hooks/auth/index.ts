import { useQuery, useMutation } from "convex/react";
import {
  useAuth as useClerkAuth,
  useSignIn as useClerkSignIn,
  useSignUp as useClerkSignUp,
} from "@clerk/clerk-expo";
import { api } from "@convex/_generated/api";
import { useEffect } from "react";
import { useAuthStore } from "../../stores";

/**
 * Get current authenticated user with profiles
 * Also syncs user to Convex if needed
 */
export function useCurrentUser() {
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const selectedRole = useAuthStore((s) => s.selectedRole);
  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const data = useQuery(api.users.getCurrentUser);

  // Sync user to Convex when signed in
  useEffect(() => {
    if (clerkLoaded && isSignedIn && data === null) {
      // User is signed in with Clerk but not in Convex yet
      // Pass the selected role (required for new users, optional for existing)
      createOrGetUser({ role: selectedRole ?? undefined });
    }
  }, [clerkLoaded, isSignedIn, data, selectedRole, createOrGetUser]);

  // Return undefined while loading to match existing component behavior
  if (!clerkLoaded) return undefined;
  if (isSignedIn && data === undefined) return undefined;
  // User is signed in but not yet synced to Convex - show loading state
  if (isSignedIn && data === null) return undefined;

  return data;
}

/**
 * Sign in result type
 */
export type SignInResult =
  | { status: "complete" }
  | {
      status: "needs_second_factor";
      prepareSecondFactor: () => Promise<void>;
      attemptSecondFactor: (code: string) => Promise<void>;
    };

/**
 * Sign in with email/password
 */
export function useSignIn() {
  const { signIn, isLoaded, setActive } = useClerkSignIn();

  return async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<SignInResult> => {
    if (!isLoaded || !signIn) {
      throw new Error("Clerk is not loaded");
    }

    // Start sign-in with identifier
    let result = await signIn.create({
      identifier: email,
    });

    // If we need first factor (password), attempt it
    if (result.status === "needs_first_factor") {
      const passwordFactor = result.supportedFirstFactors?.find(
        (factor) => factor.strategy === "password"
      );

      if (passwordFactor) {
        result = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });
      } else {
        throw new Error(
          "Password authentication not available for this account."
        );
      }
    }

    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
      return { status: "complete" };
    }

    if (result.status === "needs_second_factor") {
      // Return object with helper functions for second factor flow
      return {
        status: "needs_second_factor",
        prepareSecondFactor: async () => {
          await signIn.prepareSecondFactor({ strategy: "email_code" });
        },
        attemptSecondFactor: async (code: string) => {
          const verifyResult = await signIn.attemptSecondFactor({
            strategy: "email_code",
            code,
          });

          if (verifyResult.status === "complete") {
            await setActive({ session: verifyResult.createdSessionId });
          } else {
            throw new Error(`Verification failed: ${verifyResult.status}`);
          }
        },
      };
    }

    throw new Error(`Sign in failed: ${result.status}`);
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
 * Sign out (keeps role selection for faster re-login)
 */
export function useSignOut() {
  const { signOut } = useClerkAuth();

  return async () => {
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
