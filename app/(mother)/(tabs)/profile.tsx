import { View, Text, ScrollView, Pressable, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Moon, Sun } from "lucide-react-native";
import { useAuthStore, useBookletStore, useThemeStore } from "../../../src/stores";
import { resetSampleData } from "../../../src/data";
import { formatDate, calculateAge } from "../../../src/utils";

export default function MotherProfileScreen() {
  const router = useRouter();
  const { motherProfile, logout } = useAuthStore();
  const { getBookletsByMother, getAccessibleDoctors } = useBookletStore();
  const { colorScheme, toggleTheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  const booklets = motherProfile ? getBookletsByMother(motherProfile.id) : [];
  const activeBooklet = booklets.find((b) => b.status === "active");
  const connectedDoctors = activeBooklet
    ? getAccessibleDoctors(activeBooklet.id)
    : [];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset Data",
      "This will reset all data to the default sample data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetSampleData();
            Alert.alert("Success", "Data has been reset to defaults.");
          },
        },
      ]
    );
  };

  const age = motherProfile?.birthdate
    ? calculateAge(motherProfile.birthdate)
    : null;

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Profile Avatar */}
      <View className="items-center py-6">
        <View className="w-20 h-20 bg-pink-100 dark:bg-pink-900 rounded-full items-center justify-center mb-3">
          <Text className="text-3xl">👩</Text>
        </View>
        <Text className="text-gray-900 dark:text-white text-lg font-bold">
          {motherProfile?.fullName}
        </Text>
        {age && (
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {age} years old
          </Text>
        )}
      </View>

      {/* Personal Info */}
      <View className="px-6">
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <Text className="font-semibold text-gray-900 dark:text-white mb-3">
            Personal Information
          </Text>
          <InfoRow
            label="Birthday"
            value={
              motherProfile?.birthdate
                ? formatDate(motherProfile.birthdate)
                : undefined
            }
          />
          <InfoRow label="Contact" value={motherProfile?.contactNumber} />
          <InfoRow label="Address" value={motherProfile?.address} />
          <InfoRow
            label="Emergency Contact"
            value={motherProfile?.emergencyContactName}
          />
          <InfoRow
            label="Emergency Number"
            value={motherProfile?.emergencyContact}
            isLast
          />
        </View>
      </View>

      {/* Baby Info */}
      {motherProfile?.babyName && (
        <View className="px-6 mt-4">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">
              Baby Information
            </Text>
            <InfoRow label="Baby Name" value={motherProfile.babyName} isLast />
          </View>
        </View>
      )}

      {/* Connected Doctors */}
      <View className="px-6 mt-4">
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <Text className="font-semibold text-gray-900 dark:text-white mb-3">
            My Doctors ({connectedDoctors.length})
          </Text>
          {connectedDoctors.length === 0 ? (
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              No doctors connected yet. Share your QR code with your doctor.
            </Text>
          ) : (
            connectedDoctors.map((doctor, index) => (
              <View
                key={doctor.id}
                className={`py-3 ${
                  index < connectedDoctors.length - 1
                    ? "border-b border-gray-100 dark:border-gray-700"
                    : ""
                }`}
              >
                <Text className="text-gray-900 dark:text-white font-medium">
                  {doctor.fullName}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {doctor.specialization} • {doctor.clinicName}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Settings */}
      <View className="px-6 mt-6">
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
          Settings
        </Text>

        {/* Dark Mode Toggle */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm flex-row items-center justify-between">
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
            trackColor={{ false: "#e5e7eb", true: "#ec4899" }}
            thumbColor="#ffffff"
          />
        </View>

        <Pressable className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50 dark:active:bg-gray-700">
          <Text className="text-gray-900 dark:text-white font-medium">
            Edit Profile
          </Text>
        </Pressable>

        <Pressable className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50 dark:active:bg-gray-700">
          <Text className="text-gray-900 dark:text-white font-medium">
            Notification Settings
          </Text>
        </Pressable>

        <Pressable
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50 dark:active:bg-gray-700"
          onPress={handleResetData}
        >
          <Text className="text-amber-600 dark:text-amber-400 font-medium">
            Reset Sample Data
          </Text>
        </Pressable>

        <Pressable
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm active:bg-gray-50 dark:active:bg-gray-700"
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
