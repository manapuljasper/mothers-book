import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeSampleData } from "../src/data";
import { useBookletStore, useMedicalStore, useMedicationStore } from "../src/stores";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30 seconds
      staleTime: 30 * 1000,
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Refetch on window focus (useful for mobile when app comes to foreground)
      refetchOnWindowFocus: true,
    },
  },
});

export default function RootLayout() {
  // Initialize sample data and load stores on app start
  useEffect(() => {
    initializeSampleData();

    // Load data into stores (kept for backward compatibility during migration)
    useBookletStore.getState().loadBooklets();
    useMedicalStore.getState().loadMedicalData();
    useMedicationStore.getState().loadMedications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(doctor)" />
          <Stack.Screen name="(mother)" />
        </Stack>
        <StatusBar style="auto" />
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
