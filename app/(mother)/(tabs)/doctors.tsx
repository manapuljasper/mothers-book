import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { StorageService, StorageKey } from "../../../src/services";
import { useThemeStore } from "../../../src/stores";
import type { DoctorProfile } from "../../../src/types";

export default function DoctorsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  // Get all doctors from storage
  const allDoctors =
    StorageService.get<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES) || [];

  // Filter by search
  const filteredDoctors = allDoctors.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clinicAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.specialization?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      )
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search */}
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
          placeholder="Search by name, clinic, or location..."
          placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Doctor List */}
      <ScrollView className="flex-1 px-6 py-4">
        {filteredDoctors.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              No doctors found
            </Text>
          </View>
        ) : (
          filteredDoctors.map((doctor) => (
            <Pressable
              key={doctor.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm active:bg-gray-50 dark:active:bg-gray-700"
            >
              {/* Doctor Header */}
              <View className="flex-row">
                <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-4">
                  <Text className="text-2xl">👨‍⚕️</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white text-lg">
                    {doctor.fullName}
                  </Text>
                  <Text className="text-blue-600 dark:text-blue-400">
                    {doctor.specialization}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    PRC: {doctor.prcNumber}
                  </Text>
                </View>
              </View>

              {/* Clinic Info */}
              <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <View className="flex-row items-start mb-2">
                  <Text className="text-gray-400 mr-2">🏥</Text>
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-medium">
                      {doctor.clinicName}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      {doctor.clinicAddress}
                    </Text>
                  </View>
                </View>

                {doctor.clinicSchedule && (
                  <View className="flex-row items-start mb-2">
                    <Text className="text-gray-400 mr-2">🕐</Text>
                    <Text className="text-gray-600 dark:text-gray-300 text-sm flex-1">
                      {doctor.clinicSchedule}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-start">
                  <Text className="text-gray-400 mr-2">📞</Text>
                  <Text className="text-gray-600 dark:text-gray-300 text-sm">
                    {doctor.contactNumber}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Pressable className="bg-pink-600 rounded-lg py-3 active:bg-pink-700">
                  <Text className="text-white text-center font-semibold">
                    View Profile
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}

        <Text className="text-gray-400 dark:text-gray-500 text-xs text-center py-4">
          Connect with a doctor by visiting their clinic and scanning their QR
          code
        </Text>
      </ScrollView>
    </View>
  );
}
