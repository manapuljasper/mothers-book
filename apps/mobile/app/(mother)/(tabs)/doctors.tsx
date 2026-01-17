import { View, Text, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Building2, Clock, Phone, Star } from "lucide-react-native";
import { useThemeStore } from "../../../src/stores";
import { useAllDoctors, useSearchDoctors } from "../../../src/hooks";
import { CardPressable } from "../../../src/components/ui";

interface ScheduleItem {
  days: string;
  startTime: string;
  endTime: string;
}

interface Clinic {
  _id: string;
  name: string;
  address: string;
  contactNumber?: string;
  schedule?: ScheduleItem[];
  isPrimary: boolean;
}

export default function DoctorsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  // Get all doctors from Convex
  const allDoctors = useAllDoctors() ?? [];

  // Search doctors when query is entered
  const searchResults = useSearchDoctors(searchQuery);

  // Use search results if searching, otherwise use all doctors
  const doctors = searchQuery.length > 0 ? (searchResults ?? []) : allDoctors;
  const isLoading = searchQuery.length > 0 ? searchResults === undefined : allDoctors === undefined;

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

    return doctors.map((doctor) => {
      // Get clinics from the new structure
      const clinics = (doctor as { clinics?: Clinic[] }).clinics || [];
      const primaryClinic = clinics.find((c) => c.isPrimary) || clinics[0];
      const clinicsCount = clinics.length;

      return (
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

          {/* Primary Clinic Info (or first clinic) */}
          {primaryClinic && (
            <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <View className="flex-row items-start mb-2">
                <View className="mr-2 mt-0.5">
                  <Building2 size={16} color="#9ca3af" strokeWidth={1.5} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-gray-900 dark:text-white font-medium">
                      {primaryClinic.name}
                    </Text>
                    {primaryClinic.isPrimary && clinicsCount > 1 && (
                      <View className="flex-row items-center bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-full ml-2">
                        <Star size={10} color="#f59e0b" fill="#f59e0b" />
                        <Text className="text-amber-700 dark:text-amber-400 text-[10px] font-medium ml-0.5">
                          Primary
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {primaryClinic.address}
                  </Text>
                </View>
              </View>

              {primaryClinic.schedule && primaryClinic.schedule.length > 0 && (
                <View className="flex-row items-start mb-2">
                  <View className="mr-2 mt-0.5">
                    <Clock size={16} color="#9ca3af" strokeWidth={1.5} />
                  </View>
                  <Text className="text-gray-600 dark:text-gray-300 text-sm flex-1">
                    {primaryClinic.schedule
                      .map((s) => `${s.days}: ${s.startTime} - ${s.endTime}`)
                      .join(", ")}
                  </Text>
                </View>
              )}

              {(primaryClinic.contactNumber || doctor.contactNumber) && (
                <View className="flex-row items-start">
                  <View className="mr-2 mt-0.5">
                    <Phone size={16} color="#9ca3af" strokeWidth={1.5} />
                  </View>
                  <Text className="text-gray-600 dark:text-gray-300 text-sm">
                    {primaryClinic.contactNumber || doctor.contactNumber}
                  </Text>
                </View>
              )}

              {clinicsCount > 1 && (
                <Text className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                  +{clinicsCount - 1} more clinic{clinicsCount > 2 ? "s" : ""}
                </Text>
              )}
            </View>
          )}
        </CardPressable>
      );
    });
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
