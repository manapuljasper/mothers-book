import { View, Text, ScrollView, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Search, Users, QrCode } from "lucide-react-native";
import { useAuthStore, useBookletStore, useThemeStore } from "../../../src/stores";
import { formatRelativeDate, formatDate } from "../../../src/utils";
import { CardPressable, EmptyState } from "../../../src/components/ui";

export default function PatientsScreen() {
  const router = useRouter();
  const { doctorProfile } = useAuthStore();
  const { getBookletsByDoctor } = useBookletStore();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");

  const patientBooklets = doctorProfile ? getBookletsByDoctor(doctorProfile.id) : [];

  // Filter by search query
  const filteredBooklets = patientBooklets.filter(
    (b) =>
      b.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search */}
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-600">
          <Search size={18} color={isDark ? "#6b7280" : "#9ca3af"} strokeWidth={1.5} />
          <TextInput
            className="flex-1 ml-2 text-gray-900 dark:text-white"
            placeholder="Search patients..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Patient List */}
      <ScrollView className="flex-1 px-6 py-4">
        {filteredBooklets.length === 0 ? (
          <View className="mt-4">
            {searchQuery ? (
              <EmptyState
                icon={Search}
                title="No results found"
                description="Try a different search term"
              />
            ) : (
              <EmptyState
                icon={Users}
                iconColor="#3b82f6"
                iconBgClassName="bg-blue-50 dark:bg-blue-900/30"
                title="No patients yet"
                description="Scan a patient's QR code to add them to your list"
                action={{
                  label: "Scan QR Code",
                  icon: QrCode,
                  onPress: () => router.push("/(doctor)/(tabs)/scan"),
                }}
              />
            )}
          </View>
        ) : (
          filteredBooklets.map((booklet) => (
            <CardPressable
              key={booklet.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-3 border border-gray-100 dark:border-gray-700"
              onPress={() => router.push(`/(doctor)/booklet/${booklet.id}`)}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white text-lg">
                    {booklet.motherName}
                  </Text>
                  <Text className="text-gray-400">{booklet.label}</Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full border ${
                    booklet.status === "active"
                      ? "border-green-400"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      booklet.status === "active"
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {booklet.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <View className="flex-1">
                  <Text className="text-gray-300 dark:text-gray-500 text-xs">
                    Last Visit
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-300 text-sm">
                    {booklet.lastVisitDate
                      ? formatRelativeDate(booklet.lastVisitDate)
                      : "—"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-300 dark:text-gray-500 text-xs">
                    Next Appointment
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-300 text-sm">
                    {booklet.nextAppointment
                      ? formatDate(booklet.nextAppointment)
                      : "—"}
                  </Text>
                </View>
                {booklet.expectedDueDate && (
                  <View className="flex-1">
                    <Text className="text-gray-300 dark:text-gray-500 text-xs">
                      Due Date
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-300 text-sm">
                      {formatDate(booklet.expectedDueDate)}
                    </Text>
                  </View>
                )}
              </View>
            </CardPressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
