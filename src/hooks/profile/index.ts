/**
 * Profile Convex Hooks
 *
 * Mutation hooks for updating user profiles using Convex.
 */

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthStore } from "../../stores";

/**
 * Hook to update doctor profile
 */
export function useUpdateDoctorProfile() {
  const { updateDoctorProfile: updateStoreProfile, updateUserFullName } =
    useAuthStore();
  const mutation = useMutation(api.users.updateDoctorProfile);

  return {
    mutate: async (args: {
      doctorId: Id<"doctorProfiles">;
      fullName?: string;
      prcNumber?: string;
      clinicName?: string;
      clinicAddress?: string;
      contactNumber?: string;
      specialization?: string;
      avatarUrl?: string;
      clinicSchedule?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      const result = await mutation(args);

      // Update the auth store with new profile data
      if (result) {
        updateStoreProfile({
          id: result._id as unknown as string,
          userId: result.userId as unknown as string,
          prcNumber: result.prcNumber,
          clinicName: result.clinicName,
          clinicAddress: result.clinicAddress,
          contactNumber: result.contactNumber,
          specialization: result.specialization,
          avatarUrl: result.avatarUrl,
          clinicSchedule: result.clinicSchedule,
          latitude: result.latitude,
          longitude: result.longitude,
        });

        // Update user full name if it was changed
        if (args.fullName) {
          updateUserFullName(args.fullName);
        }
      }

      return result;
    },
    mutateAsync: async (args: {
      doctorId: Id<"doctorProfiles">;
      fullName?: string;
      prcNumber?: string;
      clinicName?: string;
      clinicAddress?: string;
      contactNumber?: string;
      specialization?: string;
      avatarUrl?: string;
      clinicSchedule?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      const result = await mutation(args);

      // Update the auth store with new profile data
      if (result) {
        updateStoreProfile({
          id: result._id as unknown as string,
          userId: result.userId as unknown as string,
          prcNumber: result.prcNumber,
          clinicName: result.clinicName,
          clinicAddress: result.clinicAddress,
          contactNumber: result.contactNumber,
          specialization: result.specialization,
          avatarUrl: result.avatarUrl,
          clinicSchedule: result.clinicSchedule,
          latitude: result.latitude,
          longitude: result.longitude,
        });

        if (args.fullName) {
          updateUserFullName(args.fullName);
        }
      }

      return result;
    },
  };
}

/**
 * Hook to update mother profile
 */
export function useUpdateMotherProfile() {
  const { updateMotherProfile: updateStoreProfile, updateUserFullName } =
    useAuthStore();
  const mutation = useMutation(api.users.updateMotherProfile);

  return {
    mutate: async (args: {
      motherId: Id<"motherProfiles">;
      fullName?: string;
      birthdate?: number;
      contactNumber?: string;
      address?: string;
      emergencyContact?: string;
      emergencyContactName?: string;
      avatarUrl?: string;
      babyName?: string;
    }) => {
      const result = await mutation(args);

      // Update the auth store with new profile data
      if (result) {
        updateStoreProfile({
          id: result._id as unknown as string,
          userId: result.userId as unknown as string,
          birthdate: new Date(result.birthdate),
          contactNumber: result.contactNumber,
          address: result.address,
          emergencyContact: result.emergencyContact,
          emergencyContactName: result.emergencyContactName,
          avatarUrl: result.avatarUrl,
          babyName: result.babyName,
        });

        if (args.fullName) {
          updateUserFullName(args.fullName);
        }
      }

      return result;
    },
    mutateAsync: async (args: {
      motherId: Id<"motherProfiles">;
      fullName?: string;
      birthdate?: number;
      contactNumber?: string;
      address?: string;
      emergencyContact?: string;
      emergencyContactName?: string;
      avatarUrl?: string;
      babyName?: string;
    }) => {
      const result = await mutation(args);

      if (result) {
        updateStoreProfile({
          id: result._id as unknown as string,
          userId: result.userId as unknown as string,
          birthdate: new Date(result.birthdate),
          contactNumber: result.contactNumber,
          address: result.address,
          emergencyContact: result.emergencyContact,
          emergencyContactName: result.emergencyContactName,
          avatarUrl: result.avatarUrl,
          babyName: result.babyName,
        });

        if (args.fullName) {
          updateUserFullName(args.fullName);
        }
      }

      return result;
    },
  };
}
