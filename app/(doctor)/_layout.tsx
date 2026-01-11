import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../src/stores";

export default function DoctorLayout() {
  const { isAuthenticated, currentRole } = useAuthStore();

  // Redirect if not authenticated or not a doctor
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (currentRole !== "doctor") {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booklet" />
      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
