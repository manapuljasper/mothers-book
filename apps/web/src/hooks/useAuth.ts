"use client";

import { useAuth as useClerkAuth, useSignIn as useClerkSignIn, useSignUp as useClerkSignUp } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "../stores";
import { useMemo, useEffect } from "react";

export function useCurrentUser() {
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const data = useQuery(api.users.getCurrentUser);
  const { detectRole } = useAuthStore();

  // Sync user to Convex when signed in
  useEffect(() => {
    if (clerkLoaded && isSignedIn && data === null) {
      // User is signed in with Clerk but not in Convex yet
      createOrGetUser();
    }
  }, [clerkLoaded, isSignedIn, data, createOrGetUser]);

  const role = useMemo(() => {
    if (!data) return null;
    return detectRole(
      data.doctorProfile ?? null,
      data.motherProfile ?? null,
      data.superAdminProfile ?? null
    );
  }, [data, detectRole]);

  return {
    user: data?.user ?? null,
    doctorProfile: data?.doctorProfile ?? null,
    motherProfile: data?.motherProfile ?? null,
    superAdminProfile: data?.superAdminProfile ?? null,
    role,
    isLoading: !clerkLoaded || (isSignedIn && data === undefined),
    isAuthenticated: !!isSignedIn && !!data?.user,
  };
}

export function useSignIn() {
  const { signIn, isLoaded } = useClerkSignIn();

  return async ({ email, password }: { email: string; password: string }) => {
    if (!isLoaded || !signIn) {
      throw new Error("Clerk is not loaded");
    }

    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === "complete") {
      // Session will be set automatically by Clerk
      return result;
    }

    throw new Error("Sign in failed");
  };
}

export function useSignUp() {
  const { signUp, isLoaded } = useClerkSignUp();

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
      return result;
    }

    // Handle verification if needed
    if (result.status === "missing_requirements") {
      // For email/password signups, we may need email verification
      // This depends on your Clerk dashboard settings
      throw new Error("Additional verification required");
    }

    throw new Error("Sign up failed");
  };
}

export function useSignOut() {
  const { signOut } = useClerkAuth();
  const { clearRole } = useAuthStore();

  return async () => {
    clearRole();
    await signOut();
  };
}
