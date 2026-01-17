import { View, Text } from "react-native";
import { Tabs, Slot } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Home, BookOpen, User } from "lucide-react-native";
import { useThemeStore } from "../../../src/stores";
import { useResponsive } from "../../../src/hooks";
import { ResponsiveTabLayout } from "../../../src/components/layout";

const HEADER_BASE_HEIGHT = 60;

function HeaderTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="pb-2">
      <Text className="text-white text-3xl font-bold">{title}</Text>
      <Text className="text-white/70 text-sm">{subtitle}</Text>
    </View>
  );
}

export default function MotherTabsLayout() {
  const insets = useSafeAreaInsets();
  const headerHeight = HEADER_BASE_HEIGHT + insets.top;
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const { isTablet } = useResponsive();

  // On tablet, use sidebar navigation instead of bottom tabs
  if (isTablet) {
    return (
      <ResponsiveTabLayout role="mother">
        <Slot />
      </ResponsiveTabLayout>
    );
  }

  // On phone, use standard bottom tabs
  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={["bottom"]}
    >
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ec4899",
            height: headerHeight,
          },
          headerTitleAlign: "left",
          tabBarActiveTintColor: "#ec4899",
          tabBarInactiveTintColor: isDark ? "#6b7280" : "#9ca3af",
          tabBarStyle: {
            backgroundColor: isDark ? "#111827" : "#ffffff",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#374151" : "#e5e7eb",
            paddingTop: 8,
            paddingBottom: 8,
            paddingHorizontal: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false, // Hide header - we have a custom header
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="booklets"
          options={{
            title: "Booklet",
            headerTitle: () => (
              <HeaderTitle title="Booklets" subtitle="Your pregnancy records" />
            ),
            tabBarIcon: ({ color, size }) => (
              <BookOpen size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitle: () => (
              <HeaderTitle title="Profile" subtitle="Your information" />
            ),
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        {/* Hide old tabs from tab bar */}
        <Tabs.Screen
          name="medications"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="doctors"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
