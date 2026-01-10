import "../global.css";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { useAuthStore, useThemeStore } from "../src/stores";
import { useInitializeAuth } from "../src/hooks";

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

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isInitialized, isLoading } = useAuthStore();
  const initializeAuthMutation = useInitializeAuth();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    initializeAuthMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading screen while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? "#111827" : "#f9fafb" }}
      >
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#6366f1"} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <ThemeProvider>
          <AuthInitializer>
            <View className="flex-1 bg-gray-50 dark:bg-gray-900">
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(doctor)" />
                <Stack.Screen name="(mother)" />
              </Stack>
            </View>
            <StatusBar style={"light"} />
          </AuthInitializer>
        </ThemeProvider>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
