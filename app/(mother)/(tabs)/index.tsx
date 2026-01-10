import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAuthStore,
  useBookletStore,
  useMedicationStore,
} from "../../../src/stores";
import { formatDate } from "../../../src/utils";
import { CardPressable } from "../../../src/components/ui";

export default function MotherHomeScreen() {
  const { motherProfile } = useAuthStore();
  const { getBookletsByMother } = useBookletStore();
  const { getActiveMedications } = useMedicationStore();

  const booklets = motherProfile ? getBookletsByMother(motherProfile.id) : [];
  const activeBooklets = booklets.filter((b) => b.status === "active");
  const activeMedications = motherProfile
    ? getActiveMedications().filter((m) =>
        booklets.some((b) => b.id === m.bookletId)
      )
    : [];

  const pendingMeds = activeMedications.filter((m) => {
    const takenToday = m.todayLogs.filter((l) => l.status === "taken").length;
    return takenToday < m.frequencyPerDay;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-pink-600 px-6 py-8">
          <Text className="text-white text-lg">Hello,</Text>
          <Text className="text-white text-2xl font-bold">
            {motherProfile?.fullName || "Mom"}
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row px-4 -mt-4">
          <View className="flex-1 bg-white rounded-xl p-4 mx-2 shadow-sm">
            <Text className="text-3xl font-bold text-pink-600">
              {activeBooklets.length}
            </Text>
            <Text className="text-gray-500 text-sm">Active Booklets</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 mx-2 shadow-sm">
            <Text className="text-3xl font-bold text-amber-600">
              {pendingMeds.length}
            </Text>
            <Text className="text-gray-500 text-sm">Meds Today</Text>
          </View>
        </View>

        {/* Active Booklets */}
        <View className="px-6 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              My Booklets
            </Text>
            <CardPressable>
              <Text className="text-pink-600 font-medium">+ New</Text>
            </CardPressable>
          </View>

          {activeBooklets.length === 0 ? (
            <View className="bg-white rounded-xl p-6">
              <Text className="text-gray-500 text-center">
                No active booklets
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2">
                Create a new booklet to start tracking your pregnancy
              </Text>
            </View>
          ) : (
            activeBooklets.map((booklet) => (
              <CardPressable key={booklet.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-lg">
                      {booklet.label}
                    </Text>
                    {booklet.expectedDueDate && (
                      <Text className="text-pink-600 text-sm mt-1">
                        Due: {formatDate(booklet.expectedDueDate)}
                      </Text>
                    )}
                  </View>
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-700 text-xs font-medium">
                      {booklet.status}
                    </Text>
                  </View>
                </View>
                {booklet.notes && (
                  <Text
                    className="text-gray-500 text-sm mt-2"
                    numberOfLines={2}
                  >
                    {booklet.notes}
                  </Text>
                )}
              </CardPressable>
            ))
          )}
        </View>

        {/* Completed/Archived Booklets */}
        {booklets.filter((b) => b.status !== "active").length > 0 && (
          <View className="px-6 mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Past Booklets
            </Text>
            {booklets
              .filter((b) => b.status !== "active")
              .map((booklet) => (
                <CardPressable key={booklet.id} className="bg-gray-100 rounded-xl p-4 mb-3">
                  <Text className="font-medium text-gray-700">
                    {booklet.label}
                  </Text>
                  {booklet.actualDeliveryDate && (
                    <Text className="text-gray-500 text-sm">
                      Delivered: {formatDate(booklet.actualDeliveryDate)}
                    </Text>
                  )}
                </CardPressable>
              ))}
          </View>
        )}

        {/* Today's Medications Reminder */}
        {pendingMeds.length > 0 && (
          <View className="px-6 mt-6 mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Today's Medications
            </Text>
            {pendingMeds.slice(0, 3).map((med) => (
              <View key={med.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-semibold text-gray-900">
                      {med.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">{med.dosage}</Text>
                  </View>
                  <View className="bg-amber-100 px-3 py-1 rounded-full">
                    <Text className="text-amber-700 text-sm">
                      {med.todayLogs.filter((l) => l.status === "taken").length}
                      /{med.frequencyPerDay} taken
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
