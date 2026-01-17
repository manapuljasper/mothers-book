import { Redirect, Stack } from "expo-router";
import { useCurrentUser } from "../../src/hooks";

export default function DoctorLayout() {
  const currentUser = useCurrentUser();

  if (currentUser === undefined) return null;
  if (!currentUser) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booklet" />
      <Stack.Screen
        name="edit-profile"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}
