import { View, Text, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Search, Users, QrCode } from "lucide-react-native";
import { useAuthStore, useThemeStore } from "@/stores";
import { useBookletsByDoctor } from "@/hooks";
import { formatRelativeDate, formatDate } from "@/utils";
import { CardPressable, EmptyState, BookletCard } from "@/components/ui";

export default function PatientsScreen() {
  const router = useRouter();
  const { doctorProfile } = useAuthStore();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patientBooklets = [], isLoading } = useBookletsByDoctor(
    doctorProfile?.id
  );

  // Filter by search query
  const filteredBooklets = patientBooklets.filter(
    (b) =>
      b.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

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
            <BookletCard
              key={booklet.id}
              booklet={booklet}
              onPress={() => router.push(`/(doctor)/booklet/${booklet.id}`)}
              variant="doctor"
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
