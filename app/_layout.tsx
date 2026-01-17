import "../global.css";
import { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useColorScheme } from "nativewind";
import { useThemeStore } from "../src/stores";
import { useCurrentUser, useNetworkListener, useSyncProcessor } from "../src/hooks";
import { OfflineBanner } from "../src/components/ui";

// Create Convex client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!clerkPublishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme: themeColorScheme } = useThemeStore();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(themeColorScheme);
  }, [themeColorScheme, setColorScheme]);

  return <>{children}</>;
}

function RootContent() {
  const currentUser = useCurrentUser();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  // Initialize network monitoring and sync processor
  useNetworkListener();
  useSyncProcessor();

  // Show loading while Convex fetches auth state
  if (currentUser === undefined) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? "#111827" : "#f9fafb" }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#818cf8" : "#6366f1"}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(doctor)" />
        <Stack.Screen name="(mother)" />
      </Stack>
      <StatusBar style="light" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={Platform.OS !== "web" ? tokenCache : undefined}
      publishableKey={clerkPublishableKey}
    >
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <KeyboardProvider>
            <ThemeProvider>
              <RootContent />
            </ThemeProvider>
          </KeyboardProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
