"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "../stores";
import { useMemo } from "react";

export function useCurrentUser() {
  const data = useQuery(api.users.getCurrentUser);
  const { detectRole } = useAuthStore();

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
    isLoading: data === undefined,
    isAuthenticated: !!data?.user,
  };
}

export function useSignIn() {
  const { signIn } = useAuthActions();
  return signIn;
}

export function useSignOut() {
  const { signOut } = useAuthActions();
  return signOut;
}
