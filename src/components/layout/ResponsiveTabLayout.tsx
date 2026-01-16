/**
 * Responsive Tab Layout
 *
 * On tablet: renders sidebar navigation + content side by side
 * On phone: just renders children (to be wrapped in Tabs component)
 *
 * This component should wrap the tab content on tablet,
 * while phone uses the standard Expo Router Tabs.
 */

import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sidebar, type SidebarRole } from "../navigation";
import { useResponsive } from "@/hooks";

interface ResponsiveTabLayoutProps {
  role: SidebarRole;
  children: React.ReactNode;
}

export function ResponsiveTabLayout({
  role,
  children,
}: ResponsiveTabLayoutProps) {
  const { isTablet } = useResponsive();

  // On phone, this component shouldn't be used - just render children
  if (!isTablet) {
    return <>{children}</>;
  }

  // On tablet, render sidebar + content
  return (
    <SafeAreaView
      className="flex-1 flex-row bg-gray-50 dark:bg-gray-900"
      edges={["top", "bottom"]}
    >
      <Sidebar role={role} />
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
