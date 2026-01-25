import { Stack } from "expo-router";
import { fastModalOptions } from "../../../src/utils/navigation.utils";

export default function BookletLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[bookletId]" />
      <Stack.Screen name="new" options={fastModalOptions} />
      <Stack.Screen name="entry" options={fastModalOptions} />
    </Stack>
  );
}
