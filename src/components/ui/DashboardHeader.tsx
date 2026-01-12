import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DashboardHeaderProps {
  userName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const initials = getInitials(userName);

  return (
    <View
      className="bg-pink-500 pb-10 px-6 rounded-b-3xl"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-3xl font-bold text-white tracking-tight">
            Home
          </Text>
          <Text className="text-white/90 text-sm mt-1">
            {greeting}, {userName.split(" ")[0]}
          </Text>
        </View>
        <View className="h-10 w-10 rounded-full bg-white/20 items-center justify-center border-2 border-white/30">
          <Text className="text-white font-bold text-sm">{initials}</Text>
        </View>
      </View>
    </View>
  );
}
