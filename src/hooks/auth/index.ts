/**
 * Auth Convex Hooks
 *
 * Hooks for authentication operations using Convex Auth.
 * These hooks call Convex auth functions and update the auth store.
 */

import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from "../../stores";
import type { UserRole } from "../../types";

/**
 * Hook to get current user from Convex
 */
export function useCurrentUser() {
  return useQuery(api.users.getCurrentUser, {});
}

/**
 * Sign in hook
 * Uses Convex Auth for password authentication
 */
export function useSignIn() {
  const { signIn } = useAuthActions();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return {
    mutate: async ({ email, password }: { email: string; password: string }) => {
      setLoading(true);
      try {
        await signIn("password", { email, password, flow: "signIn" });
        // Auth state will be updated by the ConvexProviderWithAuth
        setLoading(false);
        return { success: true };
      } catch (error) {
        setLoading(false);
        return { success: false, error: String(error) };
      }
    },
    mutateAsync: async ({ email, password }: { email: string; password: string }) => {
      setLoading(true);
      try {
        await signIn("password", { email, password, flow: "signIn" });
        setLoading(false);
        return { success: true };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    isPending: false,
  };
}

/**
 * Sign up hook
 * Creates user via Convex Auth and then creates profile
 */
export function useSignUp() {
  const { signIn } = useAuthActions();
  const createUser = useMutation(api.users.createUser);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return {
    mutate: async ({
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
    }) => {
      setLoading(true);
      try {
        // First create the auth user via Convex Auth
        await signIn("password", { email, password, flow: "signUp" });

        // Then create the user profile
        // Note: The tokenIdentifier will be available after auth
        // This needs to be called after the auth state is established

        setLoading(false);
        return { success: true };
      } catch (error) {
        setLoading(false);
        return { success: false, error: String(error) };
      }
    },
    mutateAsync: async ({
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
    }) => {
      setLoading(true);
      try {
        await signIn("password", { email, password, flow: "signUp" });
        setLoading(false);
        return { success: true };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    isPending: false,
  };
}

/**
 * Sign out hook
 */
export function useSignOut() {
  const { signOut } = useAuthActions();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return {
    mutate: async () => {
      setLoading(true);
      try {
        await signOut();
        clearAuth();
        setLoading(false);
        return { success: true };
      } catch (error) {
        clearAuth();
        setLoading(false);
        return { success: false, error: String(error) };
      }
    },
    mutateAsync: async () => {
      setLoading(true);
      try {
        await signOut();
        clearAuth();
        setLoading(false);
        return { success: true };
      } catch (error) {
        clearAuth();
        setLoading(false);
        throw error;
      }
    },
    isPending: false,
  };
}

/**
 * Initialize auth hook - for app startup
 * Checks existing session and loads profile from Convex
 */
export function useInitializeAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const setLoading = useAuthStore((state) => state.setLoading);
  const currentUser = useCurrentUser();

  return {
    mutate: async () => {
      setLoading(true);

      if (currentUser) {
        const { user, doctorProfile, motherProfile } = currentUser;

        if (user) {
          setAuth({
            user: {
              id: user._id as unknown as string,
              email: user.email,
              role: user.role,
              fullName: user.fullName,
              createdAt: new Date(user._creationTime),
            },
            role: user.role,
            doctorProfile: doctorProfile
              ? {
                  id: doctorProfile._id as unknown as string,
                  userId: doctorProfile.userId as unknown as string,
                  prcNumber: doctorProfile.prcNumber,
                  clinicName: doctorProfile.clinicName,
                  clinicAddress: doctorProfile.clinicAddress,
                  contactNumber: doctorProfile.contactNumber,
                  specialization: doctorProfile.specialization,
                  avatarUrl: doctorProfile.avatarUrl,
                  clinicSchedule: doctorProfile.clinicSchedule,
                  latitude: doctorProfile.latitude,
                  longitude: doctorProfile.longitude,
                }
              : null,
            motherProfile: motherProfile
              ? {
                  id: motherProfile._id as unknown as string,
                  userId: motherProfile.userId as unknown as string,
                  birthdate: new Date(motherProfile.birthdate),
                  contactNumber: motherProfile.contactNumber,
                  address: motherProfile.address,
                  emergencyContact: motherProfile.emergencyContact,
                  emergencyContactName: motherProfile.emergencyContactName,
                  avatarUrl: motherProfile.avatarUrl,
                  babyName: motherProfile.babyName,
                }
              : null,
          });
        }
      }

      setLoading(false);
      setInitialized(true);
      return { success: true };
    },
    mutateAsync: async () => {
      setLoading(true);

      if (currentUser) {
        const { user, doctorProfile, motherProfile } = currentUser;

        if (user) {
          setAuth({
            user: {
              id: user._id as unknown as string,
              email: user.email,
              role: user.role,
              fullName: user.fullName,
              createdAt: new Date(user._creationTime),
            },
            role: user.role,
            doctorProfile: doctorProfile
              ? {
                  id: doctorProfile._id as unknown as string,
                  userId: doctorProfile.userId as unknown as string,
                  prcNumber: doctorProfile.prcNumber,
                  clinicName: doctorProfile.clinicName,
                  clinicAddress: doctorProfile.clinicAddress,
                  contactNumber: doctorProfile.contactNumber,
                  specialization: doctorProfile.specialization,
                  avatarUrl: doctorProfile.avatarUrl,
                  clinicSchedule: doctorProfile.clinicSchedule,
                  latitude: doctorProfile.latitude,
                  longitude: doctorProfile.longitude,
                }
              : null,
            motherProfile: motherProfile
              ? {
                  id: motherProfile._id as unknown as string,
                  userId: motherProfile.userId as unknown as string,
                  birthdate: new Date(motherProfile.birthdate),
                  contactNumber: motherProfile.contactNumber,
                  address: motherProfile.address,
                  emergencyContact: motherProfile.emergencyContact,
                  emergencyContactName: motherProfile.emergencyContactName,
                  avatarUrl: motherProfile.avatarUrl,
                  babyName: motherProfile.babyName,
                }
              : null,
          });
        }
      }

      setLoading(false);
      setInitialized(true);
      return { success: true };
    },
    isPending: false,
  };
}
