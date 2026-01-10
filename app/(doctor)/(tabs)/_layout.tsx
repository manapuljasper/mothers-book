import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Home, ClipboardList, ScanLine, User } from "lucide-react-native";

export default function DoctorTabsLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#3b82f6",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
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
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="patients"
          options={{
            title: "Patients",
            tabBarIcon: ({ color, size }) => (
              <ClipboardList size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scan QR",
            tabBarIcon: ({ color, size }) => (
              <ScanLine size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
