import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../src/stores";

export default function MotherLayout() {
  const { isAuthenticated, currentRole } = useAuthStore();

  // Redirect if not authenticated or not a mother
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (currentRole !== "mother") {
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
      <Stack.Screen
        name="view-doctor"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
