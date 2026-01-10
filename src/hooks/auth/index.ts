/**
 * Auth React Query Hooks
 *
 * Mutation hooks for authentication operations.
 * These hooks call the auth service and update the auth store.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authService from "../../services/auth.service";
import { useAuthStore } from "../../stores";
import type { UserRole } from "../../types";

/**
 * Sign in mutation hook
 * Calls auth service and updates auth store on success
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onMutate: () => {
      console.log("onMutate");
      setLoading(true);
    },
    onSuccess: (result) => {
      if (result.success && result.user) {
        setAuth({
          user: result.user,
          role: result.role || null,
          doctorProfile: result.doctorProfile || null,
          motherProfile: result.motherProfile || null,
        });
      }
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
    onSettled: () => {
      // Invalidate any queries that might depend on auth
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Sign up mutation hook
 * Calls auth service and updates auth store on success
 */
export function useSignUp() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: ({
      email,
      password,
      role,
      fullName,
      extraData,
    }: {
      email: string;
      password: string;
      role: UserRole;
      fullName: string;
      extraData?: Record<string, unknown>;
    }) => authService.signUp(email, password, role, fullName, extraData),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (result) => {
      if (result.success && result.user) {
        setAuth({
          user: result.user,
          role: result.role || null,
          doctorProfile: result.doctorProfile || null,
          motherProfile: result.motherProfile || null,
        });
      }
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Sign out mutation hook
 * Calls auth service and clears auth store
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: () => authService.signOut(),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      clearAuth();
      // Clear all cached queries on logout
      queryClient.clear();
    },
    onError: () => {
      // Clear auth even on error to ensure clean state
      clearAuth();
      setLoading(false);
    },
  });
}

/**
 * Initialize auth hook - for app startup
 * Checks existing session and loads profile
 */
export function useInitializeAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: () => authService.initializeAuth(),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (result) => {
      if (result.success && result.user) {
        setAuth({
          user: result.user,
          role: result.role || null,
          doctorProfile: result.doctorProfile || null,
          motherProfile: result.motherProfile || null,
        });
      }
      setLoading(false);
      setInitialized(true);
    },
    onError: () => {
      setLoading(false);
      setInitialized(true);
    },
  });
}
