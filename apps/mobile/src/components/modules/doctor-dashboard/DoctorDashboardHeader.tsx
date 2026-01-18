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
    <View
      className="bg-doctor-500 pb-10 px-6 rounded-b-3xl"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </Text>
          <Text className="text-white/90 text-sm mt-1">
            {greeting} {doctorName}
          </Text>
        </View>

        {/* Right side - Avatar */}
        <CardPressable
          onPress={onAvatarPress}
          className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/30"
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full bg-white/20 items-center justify-center">
              <Text className="text-white font-bold text-sm">{initials}</Text>
            </View>
          )}
        </CardPressable>
      </View>
    </View>
  );
}
