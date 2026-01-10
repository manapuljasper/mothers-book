import { Stack } from "expo-router";

export default function DoctorBookletLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[bookletId]" />
    </Stack>
  );
}
