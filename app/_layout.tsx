import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initializeSampleData } from "../src/data";
import { useBookletStore, useMedicalStore, useMedicationStore } from "../src/stores";

export default function RootLayout() {
  // Initialize sample data and load stores on app start
  useEffect(() => {
    initializeSampleData();

    // Load data into stores
    useBookletStore.getState().loadBooklets();
    useMedicalStore.getState().loadMedicalData();
    useMedicationStore.getState().loadMedications();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(doctor)" />
        <Stack.Screen name="(mother)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
