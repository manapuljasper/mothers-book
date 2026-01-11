import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore, selectIsProfileComplete } from "../src/stores";

export default function Index() {
  const { isAuthenticated, currentRole } = useAuthStore();
  const isProfileComplete = useAuthStore(selectIsProfileComplete);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect based on role and profile completeness
  if (currentRole === "doctor") {
    if (!isProfileComplete) {
      return <Redirect href="/(doctor)/edit-profile?mode=create" />;
    }
    return <Redirect href="/(doctor)/(tabs)" />;
  }

  if (currentRole === "mother") {
    if (!isProfileComplete) {
      return <Redirect href="/(mother)/edit-profile?mode=create" />;
    }
    return <Redirect href="/(mother)/(tabs)" />;
  }

  // Show loading while determining redirect
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
