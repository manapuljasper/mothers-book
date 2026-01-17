import { Stack } from "expo-router";

export default function EntryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[entryId]" />
    </Stack>
  );
}
