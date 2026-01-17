/**
 * Sidebar Navigation Component
 *
 * Vertical navigation sidebar for iPad. Replaces bottom tabs on tablet-sized devices.
 * Supports both doctor (blue) and mother (pink) color schemes.
 */

import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  ClipboardList,
  ScanLine,
  User,
  BookOpen,
  type LucideIcon,
} from "lucide-react-native";
import { useThemeStore } from "@/stores";
import { useCurrentUser } from "@/hooks";

export type SidebarRole = "doctor" | "mother";

interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
}

const DOCTOR_NAV_ITEMS: NavItem[] = [
  { icon: Home, label: "Dashboard", route: "/(doctor)/(tabs)" },
  { icon: ClipboardList, label: "Patients", route: "/(doctor)/(tabs)/patients" },
  { icon: ScanLine, label: "Scan QR", route: "/(doctor)/(tabs)/scan" },
  { icon: User, label: "Profile", route: "/(doctor)/(tabs)/profile" },
];

const MOTHER_NAV_ITEMS: NavItem[] = [
  { icon: Home, label: "Home", route: "/(mother)/(tabs)" },
  { icon: BookOpen, label: "Booklets", route: "/(mother)/(tabs)/booklets" },
  { icon: User, label: "Profile", route: "/(mother)/(tabs)/profile" },
];

interface SidebarProps {
  role: SidebarRole;
}

export function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const currentUser = useCurrentUser();

  const navItems = role === "doctor" ? DOCTOR_NAV_ITEMS : MOTHER_NAV_ITEMS;
  const accentColor = role === "doctor" ? "#3b82f6" : "#ec4899";
  const accentColorLight = role === "doctor" ? "#dbeafe" : "#fce7f3";
  const accentColorDark = role === "doctor" ? "#1e3a5f" : "#4a1a3a";

  // Get user initials for avatar
  const getUserInitials = () => {
    const fullName = currentUser?.user?.fullName;
    if (fullName) {
      const nameParts = fullName.split(" ");
      return nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : nameParts[0].substring(0, 2);
    }
    return "??";
  };

  const isRouteActive = (route: string) => {
    // Handle index routes
    if (route.endsWith("/(tabs)")) {
      const basePath = route.replace("/(tabs)", "");
      return pathname === basePath || pathname === `${basePath}/` || pathname === route.replace("/(tabs)", "/(tabs)/index");
    }
    return pathname === route || pathname.startsWith(route + "/");
  };

  return (
    <View
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      style={{
        width: 80,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      {/* Logo/Brand area */}
      <View className="items-center mb-8 px-2">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <Text className="text-white font-bold text-lg">MB</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <View className="flex-1 px-2">
        {navItems.map((item) => {
          const isActive = isRouteActive(item.route);
          const Icon = item.icon;

          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              className="items-center py-3 mb-2 rounded-xl"
              style={{
                backgroundColor: isActive
                  ? isDark
                    ? accentColorDark
                    : accentColorLight
                  : "transparent",
              }}
            >
              <Icon
                size={24}
                color={isActive ? accentColor : isDark ? "#9ca3af" : "#6b7280"}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <Text
                className="text-xs mt-1 font-medium text-center"
                style={{
                  color: isActive
                    ? accentColor
                    : isDark
                    ? "#9ca3af"
                    : "#6b7280",
                }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* User Avatar at bottom */}
      <View className="items-center px-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Pressable
          onPress={() =>
            router.push(
              role === "doctor"
                ? "/(doctor)/(tabs)/profile"
                : "/(mother)/(tabs)/profile"
            )
          }
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor: isDark ? "#374151" : "#f3f4f6",
          }}
        >
          <Text
            className="font-semibold"
            style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
          >
            {getUserInitials()}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
