import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { initializeSampleData } from "../src/data";
import {
  useBookletStore,
  useMedicalStore,
  useMedicationStore,
  useThemeStore,
} from "../src/stores";

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

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme: themeColorScheme } = useThemeStore();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(themeColorScheme);
  }, [themeColorScheme, setColorScheme]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { colorScheme } = useThemeStore();

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
        <ThemeProvider>
          <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(doctor)" />
              <Stack.Screen name="(mother)" />
            </Stack>
          </View>
          <StatusBar style={"light"} />
        </ThemeProvider>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
