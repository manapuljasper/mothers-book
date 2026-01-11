import { View, Text, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Building2, Clock, Phone } from "lucide-react-native";
import { useThemeStore } from "../../../src/stores";
import { useAllDoctors, useSearchDoctors } from "../../../src/hooks";
import { CardPressable } from "../../../src/components/ui";

export default function DoctorsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  // Get all doctors from Supabase
  const { data: allDoctors = [], isLoading: isLoadingAll } = useAllDoctors();

  // Search doctors when query is entered
  const { data: searchResults, isLoading: isSearching } = useSearchDoctors(searchQuery);

  // Use search results if searching, otherwise use all doctors
  const doctors = searchQuery.length > 0 ? (searchResults || []) : allDoctors;
  const isLoading = searchQuery.length > 0 ? isSearching : isLoadingAll;

  function getInitials(name: string | undefined) {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DR";
  }

  function renderDoctorList() {
    if (isLoading) {
      return (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color={isDark ? "#f472b6" : "#db2777"} />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Loading doctors...
          </Text>
        </View>
      );
    }

    if (doctors.length === 0) {
      return (
        <View className="items-center py-12">
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            No doctors found
          </Text>
        </View>
      );
    }

    return doctors.map((doctor) => (
      <CardPressable
        key={doctor.id}
        onPress={() => router.push(`/(mother)/view-doctor/${doctor.id}`)}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700"
      >
        {/* Doctor Header */}
        <View className="flex-row">
          <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-4">
            <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {getInitials(doctor.fullName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 dark:text-white text-lg">
              {doctor.fullName}
            </Text>
            {doctor.specialization && (
              <Text className="text-blue-600 dark:text-blue-400">
                {doctor.specialization}
              </Text>
            )}
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              PRC: {doctor.prcNumber}
            </Text>
          </View>
        </View>

        {/* Clinic Info */}
        <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <View className="flex-row items-start mb-2">
            <View className="mr-2 mt-0.5">
              <Building2 size={16} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white font-medium">
                {doctor.clinicName}
              </Text>
              {doctor.clinicAddress && (
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {doctor.clinicAddress}
                </Text>
              )}
            </View>
          </View>

          {doctor.clinicSchedule && (
            <View className="flex-row items-start mb-2">
              <View className="mr-2 mt-0.5">
                <Clock size={16} color="#9ca3af" strokeWidth={1.5} />
              </View>
              <Text className="text-gray-600 dark:text-gray-300 text-sm flex-1">
                {doctor.clinicSchedule}
              </Text>
            </View>
          )}

          {doctor.contactNumber && (
            <View className="flex-row items-start">
              <View className="mr-2 mt-0.5">
                <Phone size={16} color="#9ca3af" strokeWidth={1.5} />
              </View>
              <Text className="text-gray-600 dark:text-gray-300 text-sm">
                {doctor.contactNumber}
              </Text>
            </View>
          )}
        </View>
      </CardPressable>
    ));
  }

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
        {renderDoctorList()}

        <Text className="text-gray-400 dark:text-gray-500 text-xs text-center py-4">
          Connect with a doctor by visiting their clinic and scanning their QR
          code
        </Text>
      </ScrollView>
    </View>
  );
}
