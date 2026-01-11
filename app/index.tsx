import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCurrentUser } from "../src/hooks";
import { useAuthStore } from "../src/stores";

// Profile completeness check
// Doctor: prcNumber, clinicName, clinicAddress required
// Mother: birthdate required (always set on creation, so just check profile exists)
function isProfileComplete(
  role: "doctor" | "mother",
  doctorProfile:
    | { prcNumber?: string; clinicName?: string; clinicAddress?: string }
    | null
    | undefined,
  motherProfile: { birthdate?: number } | null | undefined
): boolean {
  if (role === "doctor") {
    return !!(
      doctorProfile?.prcNumber?.trim() &&
      doctorProfile?.clinicName?.trim() &&
      doctorProfile?.clinicAddress?.trim()
    );
  }
  if (role === "mother") {
    // Mother profile is complete if it exists (birthdate is set on creation)
    return !!motherProfile;
  }
  return false;
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

  // Not authenticated - redirect to login
  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  // Authenticated but no role selected - redirect to role selection
  if (!selectedRole) {
    return <Redirect href="/(auth)/role-select" />;
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

  // Check profile completeness
  const profileComplete = isProfileComplete(
    selectedRole,
    doctorProfile,
    motherProfile
  );

  // Redirect based on role and profile completeness
  if (selectedRole === "doctor") {
    if (!profileComplete) {
      return <Redirect href="/(doctor)/edit-profile?mode=create" />;
    }
    return <Redirect href="/(doctor)/(tabs)" />;
  }

  if (selectedRole === "mother") {
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
