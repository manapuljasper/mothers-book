/**
 * Profile React Query Hooks
 *
 * Mutation hooks for updating user profiles.
 */

import { useMutation } from "@tanstack/react-query";
import { updateDoctorProfile, updateMotherProfile } from "../../api/profile.api";
import { useAuthStore } from "../../stores";
import type { DoctorProfile, MotherProfile } from "../../types";

// Query keys for cache management
export const profileKeys = {
  all: ["profile"] as const,
  doctor: (id: string) => [...profileKeys.all, "doctor", id] as const,
  mother: (id: string) => [...profileKeys.all, "mother", id] as const,
};

interface UpdateDoctorProfileInput {
  fullName?: string;
  contactNumber?: string;
  prcNumber?: string;
  clinicName?: string;
  clinicAddress?: string;
  specialization?: string;
  clinicSchedule?: string;
}

interface UpdateMotherProfileInput {
  fullName?: string;
  contactNumber?: string;
  birthdate?: Date;
  address?: string;
  emergencyContactName?: string;
  emergencyContact?: string;
  babyName?: string;
}

/**
 * Hook to update doctor profile
 */
export function useUpdateDoctorProfile() {
  const { doctorProfile, updateDoctorProfile: updateStoreProfile, updateUserFullName } =
    useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateDoctorProfileInput): Promise<DoctorProfile> => {
      if (!doctorProfile) {
        throw new Error("No doctor profile found");
      }
      return updateDoctorProfile(doctorProfile.id, doctorProfile.userId, data);
    },
    onSuccess: (updatedProfile, variables) => {
      // Update the auth store with new profile data
      updateStoreProfile(updatedProfile);
      // Update user full name if it was changed
      if (variables.fullName) {
        updateUserFullName(variables.fullName);
      }
    },
  });
}

/**
 * Hook to update mother profile
 */
export function useUpdateMotherProfile() {
  const { motherProfile, updateMotherProfile: updateStoreProfile, updateUserFullName } =
    useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateMotherProfileInput): Promise<MotherProfile> => {
      if (!motherProfile) {
        throw new Error("No mother profile found");
      }
      return updateMotherProfile(motherProfile.id, motherProfile.userId, data);
    },
    onSuccess: (updatedProfile, variables) => {
      // Update the auth store with new profile data
      updateStoreProfile(updatedProfile);
      // Update user full name if it was changed
      if (variables.fullName) {
        updateUserFullName(variables.fullName);
      }
    },
  });
}
