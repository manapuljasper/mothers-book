import { View, Text, ScrollView, Pressable, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Moon, Sun } from "lucide-react-native";
import { useAuthStore, useThemeStore } from "../../../src/stores";
import { useSignOut } from "../../../src/hooks";

export default function DoctorProfileScreen() {
  const router = useRouter();
  const { currentUser, doctorProfile } = useAuthStore();
  const signOutMutation = useSignOut();
  const { colorScheme, toggleTheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOutMutation.mutateAsync();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Profile Avatar */}
      <View className="items-center py-6">
        <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mb-3">
          <Text className="text-3xl">👨‍⚕️</Text>
        </View>
        <Text className="text-gray-900 dark:text-white text-lg font-bold">
          {currentUser?.fullName}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          {doctorProfile?.specialization}
        </Text>
      </View>

      {/* Info Cards */}
      <View className="px-6">
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <InfoRow label="PRC Number" value={doctorProfile?.prcNumber} />
          <InfoRow label="Clinic" value={doctorProfile?.clinicName} />
          <InfoRow label="Address" value={doctorProfile?.clinicAddress} />
          <InfoRow label="Contact" value={doctorProfile?.contactNumber} />
          <InfoRow
            label="Schedule"
            value={doctorProfile?.clinicSchedule}
            isLast
          />
        </View>
      </View>

      {/* Settings */}
      <View className="px-6 mt-6">
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
          Settings
        </Text>

        {/* Dark Mode Toggle */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700 flex-row items-center justify-between">
          <View className="flex-row items-center">
            {isDark ? (
              <Moon size={20} color="#9ca3af" strokeWidth={1.5} />
            ) : (
              <Sun size={20} color="#f59e0b" strokeWidth={1.5} />
            )}
            <Text className="text-gray-900 dark:text-white font-medium ml-3">
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
            thumbColor="#ffffff"
          />
        </View>

        <Pressable className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
          <Text className="text-gray-900 dark:text-white font-medium">
            Edit Profile
          </Text>
        </Pressable>

        <Pressable className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
          <Text className="text-gray-900 dark:text-white font-medium">
            Notification Settings
          </Text>
        </Pressable>

        <Pressable
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
          onPress={handleLogout}
        >
          <Text className="text-red-600 dark:text-red-400 font-medium">
            Logout
          </Text>
        </Pressable>
      </View>

      <Text className="text-gray-400 dark:text-gray-500 text-xs text-center py-8">
        Mother's Book v1.0.0 - Phase 1
      </Text>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value?: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`py-3 ${!isLast ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
    >
      <Text className="text-gray-500 dark:text-gray-400 text-sm">{label}</Text>
      <Text className="text-gray-900 dark:text-white font-medium mt-1">
        {value || "—"}
      </Text>
    </View>
  );
}
