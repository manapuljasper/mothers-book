import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StorageService, StorageKey } from "../../../src/services";
import type { DoctorProfile } from "../../../src/types";

export default function DoctorsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Get all doctors from storage
  const allDoctors = StorageService.get<DoctorProfile[]>(StorageKey.DOCTOR_PROFILES) || [];

  // Filter by search
  const filteredDoctors = allDoctors.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clinicAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.specialization?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Find a Doctor</Text>
        <Text className="text-gray-500 text-sm">
          Browse and connect with OB-GYNs
        </Text>
      </View>

      {/* Search */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <TextInput
          className="bg-gray-100 rounded-lg px-4 py-3"
          placeholder="Search by name, clinic, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Doctor List */}
      <ScrollView className="flex-1 px-6 py-4">
        {filteredDoctors.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-gray-500 text-center">No doctors found</Text>
          </View>
        ) : (
          filteredDoctors.map((doctor) => (
            <Pressable
              key={doctor.id}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm active:bg-gray-50"
            >
              {/* Doctor Header */}
              <View className="flex-row">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-2xl">👨‍⚕️</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-lg">
                    {doctor.fullName}
                  </Text>
                  <Text className="text-blue-600">{doctor.specialization}</Text>
                  <Text className="text-gray-500 text-sm">
                    PRC: {doctor.prcNumber}
                  </Text>
                </View>
              </View>

              {/* Clinic Info */}
              <View className="mt-4 pt-4 border-t border-gray-100">
                <View className="flex-row items-start mb-2">
                  <Text className="text-gray-400 mr-2">🏥</Text>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      {doctor.clinicName}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {doctor.clinicAddress}
                    </Text>
                  </View>
                </View>

                {doctor.clinicSchedule && (
                  <View className="flex-row items-start mb-2">
                    <Text className="text-gray-400 mr-2">🕐</Text>
                    <Text className="text-gray-600 text-sm flex-1">
                      {doctor.clinicSchedule}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-start">
                  <Text className="text-gray-400 mr-2">📞</Text>
                  <Text className="text-gray-600 text-sm">
                    {doctor.contactNumber}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <View className="mt-4 pt-4 border-t border-gray-100">
                <Pressable className="bg-pink-600 rounded-lg py-3 active:bg-pink-700">
                  <Text className="text-white text-center font-semibold">
                    View Profile
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}

        <Text className="text-gray-400 text-xs text-center py-4">
          Connect with a doctor by visiting their clinic and scanning their QR code
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
