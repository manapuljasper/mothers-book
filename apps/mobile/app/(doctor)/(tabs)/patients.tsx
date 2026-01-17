import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Search, Users, QrCode, UserPlus } from "lucide-react-native";
import { useThemeStore } from "@/stores";
import { useCurrentUser, useBookletsByDoctor, useResponsive } from "@/hooks";
import { CardPressable, EmptyState, BookletCard, PatientListSkeleton } from "@/components/ui";
import { MasterDetail } from "@/components/layout";
import { BookletDetailContent } from "@/components/doctor";

export default function PatientsScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const doctorProfile = currentUser?.doctorProfile;
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const { isTablet } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookletId, setSelectedBookletId] = useState<string | null>(null);

  const patientBooklets = useBookletsByDoctor(doctorProfile?._id) ?? [];

  // Filter by search query
  const filteredBooklets = patientBooklets.filter(
    (b) =>
      b.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (currentUser === undefined || patientBooklets === undefined) {
    return <PatientListSkeleton />;
  }

  // Handle booklet selection
  const handleBookletPress = (bookletId: string) => {
    if (isTablet) {
      setSelectedBookletId(bookletId);
    } else {
      router.push(`/(doctor)/booklet/${bookletId}`);
    }
  };

  // Navigate to add patient screen
  const handleAddPatient = () => {
    router.push("/(doctor)/patients/add");
  };

  // Patient list component (used as master in split view)
  const patientList = (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search and Add */}
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-600">
            <Search size={18} color={isDark ? "#6b7280" : "#9ca3af"} strokeWidth={1.5} />
            <TextInput
              className="flex-1 ml-2 text-gray-900 dark:text-white"
              placeholder="Search patients..."
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable
            onPress={handleAddPatient}
            className="bg-blue-500 p-3 rounded-lg active:bg-blue-600"
          >
            <UserPlus size={20} color="#ffffff" strokeWidth={2} />
          </Pressable>
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
              <View>
                <EmptyState
                  icon={Users}
                  iconColor="#3b82f6"
                  iconBgClassName="bg-blue-50 dark:bg-blue-900/30"
                  title="No patients yet"
                  description="Add a patient by email or scan their QR code"
                  action={{
                    label: "Add Patient",
                    icon: UserPlus,
                    onPress: handleAddPatient,
                  }}
                />
                <Pressable
                  onPress={() => router.push("/(doctor)/(tabs)/scan")}
                  className="flex-row items-center justify-center mt-4 py-3"
                >
                  <QrCode size={18} color={isDark ? "#60a5fa" : "#3b82f6"} />
                  <Text className="text-blue-500 dark:text-blue-400 ml-2 font-medium">
                    Or scan QR code
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          filteredBooklets.map((booklet) => (
            <BookletCard
              key={booklet.id}
              booklet={booklet}
              onPress={() => handleBookletPress(booklet.id)}
              variant="doctor"
              selected={isTablet && selectedBookletId === booklet.id}
            />
          ))
        )}
      </ScrollView>
    </View>
  );

  // On tablet, use master-detail layout
  if (isTablet) {
    return (
      <MasterDetail
        master={patientList}
        detail={
          selectedBookletId ? (
            <BookletDetailContent bookletId={selectedBookletId} embedded />
          ) : null
        }
        emptyDetail={
          <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
            <EmptyState
              icon={Users}
              iconColor="#3b82f6"
              iconBgClassName="bg-blue-50 dark:bg-blue-900/30"
              title="Select a patient"
              description="Choose a patient from the list to view their booklet"
            />
          </View>
        }
      />
    );
  }

  // On phone, just show the list
  return patientList;
}
