import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useCurrentUser, useClinicsByDoctor } from "../src/hooks";
import { useAuthStore } from "../src/stores";

// Profile completeness check for doctor
// Doctor: prcNumber, contactNumber required, AND at least one clinic
function isDoctorProfileComplete(
  doctorProfile:
    | {
        prcNumber?: string;
        contactNumber?: string;
      }
    | null
    | undefined,
  clinicsCount: number
): boolean {
  return !!(
    doctorProfile?.prcNumber?.trim() &&
    doctorProfile?.contactNumber?.trim() &&
    clinicsCount > 0
  );
}

// Profile completeness check for mother
// Mother: birthdate required (always set on creation, so just check profile exists)
function isMotherProfileComplete(
  motherProfile: { birthdate?: number } | null | undefined
): boolean {
  return !!motherProfile;
}

export default function Index() {
  const currentUser = useCurrentUser();
  const { selectedRole } = useAuthStore();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const createDoctorProfile = useMutation(api.users.createDoctorProfile);
  const createMotherProfile = useMutation(api.users.createMotherProfile);

  // Get the profile for the selected role
  const doctorProfile =
    currentUser && "doctorProfile" in currentUser
      ? currentUser.doctorProfile
      : null;
  const motherProfile =
    currentUser && "motherProfile" in currentUser
      ? currentUser.motherProfile
      : null;

  // Get clinics for doctor profile (if doctor role selected)
  const clinics = useClinicsByDoctor(
    selectedRole === "doctor" && doctorProfile?._id
      ? (doctorProfile._id as string)
      : undefined
  );

  const selectedProfile =
    selectedRole === "doctor" ? doctorProfile : motherProfile;

  // Create profile if needed
  useEffect(() => {
    async function createProfileIfNeeded() {
      // Only run if we have a selected role, user is loaded, and profile doesn't exist
      if (!selectedRole || currentUser === undefined || !currentUser) return;
      if (selectedProfile !== null) return; // Profile exists
      if (isCreatingProfile) return; // Already creating

      setIsCreatingProfile(true);
      try {
        if (selectedRole === "doctor") {
          await createDoctorProfile();
        } else {
          await createMotherProfile();
        }
      } catch (error) {
        console.error("Failed to create profile:", error);
      }
      // Don't set isCreatingProfile to false - Convex will update currentUser
      // and the component will re-render with the new profile
    }

    createProfileIfNeeded();
  }, [
    selectedRole,
    currentUser,
    selectedProfile,
    isCreatingProfile,
    createDoctorProfile,
    createMotherProfile,
  ]);

  // Still loading auth state
  if (currentUser === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Not authenticated
  if (!currentUser) {
    // No role selected - go to welcome to pick role first
    if (!selectedRole) {
      return <Redirect href="/(auth)/welcome" />;
    }
    // Has role - go directly to login
    return <Redirect href="/(auth)/login" />;
  }

  // Authenticated but no role selected - redirect to role selection
  if (!selectedRole) {
    return <Redirect href="/(auth)/role-select" />;
  }

  // Check if user requires password change (for accounts created by doctors)
  if (currentUser?.user?.requiresPasswordChange) {
    return <Redirect href="/(auth)/change-password" />;
  }

  // Profile doesn't exist yet - show creating state
  if (selectedProfile === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">
          Setting up your profile...
        </Text>
      </View>
    );
  }

  // For doctors, wait for clinics to load before checking completeness
  if (selectedRole === "doctor" && clinics === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">
          Loading profile...
        </Text>
      </View>
    );
  }

  // Redirect based on role and profile completeness
  if (selectedRole === "doctor") {
    const clinicsCount = clinics?.length ?? 0;
    const profileComplete = isDoctorProfileComplete(
      doctorProfile,
      clinicsCount
    );
    if (!profileComplete) {
      return <Redirect href="/(doctor)/edit-profile?mode=create" />;
    }
    return <Redirect href="/(doctor)/(tabs)" />;
  }

  if (selectedRole === "mother") {
    const profileComplete = isMotherProfileComplete(motherProfile);
    if (!profileComplete) {
      return <Redirect href="/(mother)/edit-profile?mode=create" />;
    }
    return <Redirect href="/(mother)/(tabs)" />;
  }

  // Fallback loading
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
