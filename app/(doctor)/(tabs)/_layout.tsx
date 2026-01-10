import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Home, ClipboardList, ScanLine, User } from "lucide-react-native";
import { useThemeStore } from "../../../src/stores";

const HEADER_BASE_HEIGHT = 60;

function HeaderTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="pb-2">
      <Text className="text-white text-3xl font-bold">{title}</Text>
      <Text className="text-white/70 text-sm">{subtitle}</Text>
    </View>
  );
}

export default function DoctorTabsLayout() {
  const insets = useSafeAreaInsets();
  const headerHeight = HEADER_BASE_HEIGHT + insets.top;
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-gray-900"
      edges={["bottom"]}
    >
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: "#3b82f6",
            height: headerHeight,
          },
          headerTitleAlign: "left",
          tabBarActiveTintColor: "#3b82f6",
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
            title: "Dashboard",
            headerTitle: () => (
              <HeaderTitle title="Dashboard" subtitle="Patient overview" />
            ),
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="patients"
          options={{
            title: "Patients",
            headerTitle: () => (
              <HeaderTitle title="Patients" subtitle="Manage booklets" />
            ),
            tabBarIcon: ({ color, size }) => (
              <ClipboardList size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scan QR",
            headerTitle: () => (
              <HeaderTitle title="Scan QR" subtitle="Add new patients" />
            ),
            tabBarIcon: ({ color, size }) => (
              <ScanLine size={size} color={color} strokeWidth={1.5} />
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
      </Tabs>
    </SafeAreaView>
  );
}
