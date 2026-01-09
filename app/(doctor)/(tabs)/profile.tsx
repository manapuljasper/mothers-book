import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../src/stores";
import { resetSampleData } from "../../../src/data";

export default function DoctorProfileScreen() {
  const router = useRouter();
  const { doctorProfile, logout } = useAuthStore();

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-600 px-6 py-8 items-center">
          <View className="w-24 h-24 bg-blue-400 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">👨‍⚕️</Text>
          </View>
          <Text className="text-white text-xl font-bold">
            {doctorProfile?.fullName}
          </Text>
          <Text className="text-blue-200">{doctorProfile?.specialization}</Text>
        </View>

        {/* Info Cards */}
        <View className="px-6 -mt-4">
          <View className="bg-white rounded-xl p-4 shadow-sm">
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

        {/* Actions */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase">
            Settings
          </Text>

          <Pressable className="bg-white rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50">
            <Text className="text-gray-900 font-medium">Edit Profile</Text>
          </Pressable>

          <Pressable className="bg-white rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50">
            <Text className="text-gray-900 font-medium">Notification Settings</Text>
          </Pressable>

          <Pressable
            className="bg-white rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50"
            onPress={handleResetData}
          >
            <Text className="text-amber-600 font-medium">Reset Sample Data</Text>
          </Pressable>

          <Pressable
            className="bg-white rounded-xl p-4 shadow-sm active:bg-gray-50"
            onPress={handleLogout}
          >
            <Text className="text-red-600 font-medium">Logout</Text>
          </Pressable>
        </View>

        <Text className="text-gray-400 text-xs text-center py-8">
          Mother's Book v1.0.0 - Phase 1
        </Text>
      </ScrollView>
    </SafeAreaView>
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
      className={`py-3 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-900 font-medium mt-1">{value || "—"}</Text>
    </View>
  );
}
