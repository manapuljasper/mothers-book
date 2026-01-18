/**
 * Clinic Filter Component
 *
 * Horizontal scrollable tabs for filtering patients by clinic.
 * Shows "All Clinics" option plus individual clinic tabs.
 */

import { View, Text, ScrollView, Pressable } from "react-native";
import { Building2 } from "lucide-react-native";
import { Id } from "@convex/_generated/dataModel";

interface Clinic {
  id: Id<"doctorClinics">;
  name: string;
}

interface ClinicFilterProps {
  clinics: Clinic[];
  selectedClinicId: Id<"doctorClinics"> | null;
  onSelectClinic: (clinicId: Id<"doctorClinics"> | null) => void;
}

export function ClinicFilter({
  clinics,
  selectedClinicId,
  onSelectClinic,
}: ClinicFilterProps) {
  if (clinics.length <= 1) {
    // Don't show filter if only one or no clinics
    return null;
  }

  return (
    <View className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 py-3 gap-2"
      >
        {/* All Clinics Option */}
        <Pressable
          onPress={() => onSelectClinic(null)}
          className={`flex-row items-center px-4 py-2 rounded-full border ${
            selectedClinicId === null
              ? "bg-blue-500 border-blue-500"
              : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          }`}
        >
          <Building2
            size={14}
            color={selectedClinicId === null ? "#ffffff" : "#6b7280"}
            strokeWidth={2}
          />
          <Text
            className={`ml-1.5 text-sm font-medium ${
              selectedClinicId === null
                ? "text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            All Clinics
          </Text>
        </Pressable>

        {/* Individual Clinic Tabs */}
        {clinics.map((clinic) => {
          const isSelected = selectedClinicId === clinic.id;
          return (
            <Pressable
              key={clinic.id}
              onPress={() => onSelectClinic(clinic.id)}
              className={`px-4 py-2 rounded-full border ${
                isSelected
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
                numberOfLines={1}
              >
                {clinic.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
