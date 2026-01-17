import { Stack } from "expo-router";

export default function BookletLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[bookletId]" />
      <Stack.Screen
        name="new"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="entry"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
