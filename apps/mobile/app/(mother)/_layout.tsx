import { Redirect, Stack } from "expo-router";
import { useCurrentUser } from "../../src/hooks";
import { fastModalOptions } from "../../src/utils/navigation.utils";

export default function MotherLayout() {
  const currentUser = useCurrentUser();

  if (currentUser === undefined) return null;
  if (!currentUser) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booklet" />
      <Stack.Screen name="edit-profile" options={fastModalOptions} />
      <Stack.Screen name="view-doctor" options={fastModalOptions} />
      <Stack.Screen name="image-viewer" options={fastModalOptions} />
    </Stack>
  );
}
