import { Stack } from "expo-router";
import { fastModalOptions } from "../../../src/utils/navigation.utils";

export default function DoctorBookletLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[bookletId]" />
      <Stack.Screen name="add-entry" options={fastModalOptions} />
      <Stack.Screen name="entry/[entryId]" options={fastModalOptions} />
    </Stack>
  );
}
