import { Redirect, Stack } from "expo-router";
import { useCurrentUser } from "../../src/hooks";

export default function DoctorLayout() {
  const currentUser = useCurrentUser();

  // Show nothing while loading
  if (currentUser === undefined) {
    return null;
  }

  // Redirect if not authenticated
  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect if not a doctor
  if (currentUser.user.role !== "doctor") {
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
