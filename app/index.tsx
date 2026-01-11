import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useCurrentUser } from "../src/hooks";

// Profile completeness check
// Doctor: prcNumber, clinicName, clinicAddress required
// Mother: birthdate required
function isProfileComplete(
  role: string | undefined,
  doctorProfile: { prcNumber?: string; clinicName?: string; clinicAddress?: string } | null | undefined,
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
    return !!motherProfile?.birthdate;
  }
  return false;
}

export default function Index() {
  const currentUser = useCurrentUser();

  // Still loading auth state
  if (currentUser === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Not authenticated - redirect to login
  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  const { user, doctorProfile, motherProfile } = currentUser;
  const profileComplete = isProfileComplete(user.role, doctorProfile, motherProfile);

  // Redirect based on role and profile completeness
  if (user.role === "doctor") {
    if (!profileComplete) {
      return <Redirect href="/(doctor)/edit-profile?mode=create" />;
    }
    return <Redirect href="/(doctor)/(tabs)" />;
  }

  if (user.role === "mother") {
    if (!profileComplete) {
      return <Redirect href="/(mother)/edit-profile?mode=create" />;
    }
    return <Redirect href="/(mother)/(tabs)" />;
  }

  // Fallback loading
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
