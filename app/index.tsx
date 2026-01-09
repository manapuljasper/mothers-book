import { useEffect } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/stores";

export default function Index() {
  const { isAuthenticated, currentRole } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect based on role
  if (currentRole === "doctor") {
    return <Redirect href="/(doctor)/(tabs)" />;
  }

  if (currentRole === "mother") {
    return <Redirect href="/(mother)/(tabs)" />;
  }

  // Show loading while determining redirect
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
