import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Home, Pill, Stethoscope, User } from "lucide-react-native";

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ec4899",
            height: headerHeight,
          },
          headerTitleAlign: "left",
          tabBarActiveTintColor: "#ec4899",
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
            title: "Home",
            headerTitle: () => (
              <HeaderTitle title="Home" subtitle="Your dashboard" />
            ),
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="medications"
          options={{
            title: "Medications",
            headerTitle: () => (
              <HeaderTitle title="Medications" subtitle="Track your intake" />
            ),
            tabBarIcon: ({ color, size }) => (
              <Pill size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="doctors"
          options={{
            title: "Doctors",
            headerTitle: () => (
              <HeaderTitle title="Doctors" subtitle="Find OB-GYNs" />
            ),
            tabBarIcon: ({ color, size }) => (
              <Stethoscope size={size} color={color} strokeWidth={1.5} />
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
