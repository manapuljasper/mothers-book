import { Stack } from "expo-router";

export default function ViewDoctorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[doctorId]" />
    </Stack>
  );
}
