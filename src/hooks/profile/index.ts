/**
 * Profile Convex Hooks
 *
 * Mutation hooks for updating user profiles using Convex.
 * These return async functions that can be called directly.
 * Convex queries will automatically re-sync after mutations.
 */

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Hook to update doctor profile
 * Returns an async function to call directly
 */
export function useUpdateDoctorProfile() {
  const mutation = useMutation(api.users.updateDoctorProfile);

  return async (args: {
    doctorId: string;
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
    return await mutation({
      ...args,
      doctorId: args.doctorId as Id<"doctorProfiles">,
    });
  };
}

/**
 * Hook to update mother profile
 * Returns an async function to call directly
 */
export function useUpdateMotherProfile() {
  const mutation = useMutation(api.users.updateMotherProfile);

  return async (args: {
    motherId: string;
    fullName?: string;
    birthdate?: Date;
    contactNumber?: string;
    address?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
    avatarUrl?: string;
    babyName?: string;
  }) => {
    return await mutation({
      ...args,
      motherId: args.motherId as Id<"motherProfiles">,
      birthdate: args.birthdate?.getTime(),
    });
  };
}
