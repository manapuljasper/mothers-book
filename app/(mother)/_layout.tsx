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
    </Stack>
  );
}
