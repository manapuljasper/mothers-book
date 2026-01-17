import { View, Text, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardPressable } from "@/components/ui";

interface DoctorDashboardHeaderProps {
  doctorName: string;
  avatarUrl?: string;
  onAvatarPress?: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DoctorDashboardHeader({
  doctorName,
  avatarUrl,
  onAvatarPress,
}: DoctorDashboardHeaderProps) {
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const initials = getInitials(doctorName);

  return (
    <View className="px-6 pb-6" style={{ paddingTop: 32 }}>
      <View className="flex-row justify-between items-center">
        {/* Left side - Greeting */}
        <View className="flex-1">
          <Text className="text-gray-500 dark:text-slate-400 text-sm font-medium leading-none mb-1">
            {greeting}
          </Text>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {doctorName}
          </Text>
        </View>

        {/* Right side - Avatar */}
        <CardPressable
          onPress={onAvatarPress}
          className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-slate-700"
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full bg-doctor-500 items-center justify-center">
              <Text className="text-white font-bold text-base">{initials}</Text>
            </View>
          )}
        </CardPressable>
      </View>
    </View>
  );
}
