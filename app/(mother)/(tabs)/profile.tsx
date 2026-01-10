import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore, useBookletStore } from "../../../src/stores";
import { resetSampleData } from "../../../src/data";
import { formatDate, calculateAge } from "../../../src/utils";

export default function MotherProfileScreen() {
  const router = useRouter();
  const { motherProfile, logout } = useAuthStore();
  const { getBookletsByMother, getAccessibleDoctors } = useBookletStore();

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
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Avatar */}
      <View className="items-center py-6">
        <View className="w-20 h-20 bg-pink-100 rounded-full items-center justify-center mb-3">
          <Text className="text-3xl">👩</Text>
        </View>
        <Text className="text-gray-900 text-lg font-bold">
          {motherProfile?.fullName}
        </Text>
        {age && <Text className="text-gray-500 text-sm">{age} years old</Text>}
      </View>

      {/* Personal Info */}
      <View className="px-6">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="font-semibold text-gray-900 mb-3">
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
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="font-semibold text-gray-900 mb-3">
                Baby Information
              </Text>
              <InfoRow
                label="Baby Name"
                value={motherProfile.babyName}
                isLast
              />
            </View>
          </View>
        )}

        {/* Connected Doctors */}
        <View className="px-6 mt-4">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="font-semibold text-gray-900 mb-3">
              My Doctors ({connectedDoctors.length})
            </Text>
            {connectedDoctors.length === 0 ? (
              <Text className="text-gray-500 text-sm">
                No doctors connected yet. Share your QR code with your doctor.
              </Text>
            ) : (
              connectedDoctors.map((doctor, index) => (
                <View
                  key={doctor.id}
                  className={`py-3 ${
                    index < connectedDoctors.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <Text className="text-gray-900 font-medium">
                    {doctor.fullName}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {doctor.specialization} • {doctor.clinicName}
                  </Text>
                </View>
              ))
            )}
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
            <Text className="text-gray-900 font-medium">
              Notification Settings
            </Text>
          </Pressable>

          <Pressable
            className="bg-white rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50"
            onPress={handleResetData}
          >
            <Text className="text-amber-600 font-medium">
              Reset Sample Data
            </Text>
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
    <View className={`py-3 ${!isLast ? "border-b border-gray-100" : ""}`}>
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-900 font-medium mt-1">{value || "—"}</Text>
    </View>
  );
}
