import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Pill } from "lucide-react-native";
import { useAuthStore, useMedicationStore } from "@/stores";
import { useBookletsByMother } from "@/hooks";
import { formatDate } from "@/utils";
import { CardPressable, StatCard, BookletCard, EmptyState } from "@/components/ui";

export default function MotherHomeScreen() {
  const router = useRouter();
  const { motherProfile } = useAuthStore();

  const { data: booklets = [], isLoading } = useBookletsByMother(
    motherProfile?.id
  );
  const { getActiveMedications } = useMedicationStore();

  const activeBooklets = booklets.filter((b) => b.status === "active");
  const pastBooklets = booklets.filter((b) => b.status !== "active");
  const activeMedications = motherProfile
    ? getActiveMedications().filter((m) =>
        booklets.some((b) => b.id === m.bookletId)
      )
    : [];

  const pendingMeds = activeMedications.filter((m) => {
    const takenToday = m.todayLogs.filter((l) => l.status === "taken").length;
    return takenToday < m.frequencyPerDay;
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Quick Stats */}
      <View className="flex-row px-4 pt-4">
        <StatCard
          value={activeBooklets.length}
          label="Active Booklets"
          color="pink"
        />
        <StatCard value={pendingMeds.length} label="Meds Today" color="amber" />
      </View>

      {/* Active Booklets */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            My Booklets
          </Text>
          <CardPressable onPress={() => router.push("/booklet/new")}>
            <Text className="text-pink-600 dark:text-pink-400 font-medium">
              + New
            </Text>
          </CardPressable>
        </View>

        {activeBooklets.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No active booklets"
            description="Create a new booklet to start tracking your pregnancy"
          />
        ) : (
          activeBooklets.map((booklet) => (
            <BookletCard
              key={booklet.id}
              booklet={booklet}
              onPress={() => router.push(`/booklet/${booklet.id}`)}
              variant="mother"
            />
          ))
        )}
      </View>

      {/* Completed/Archived Booklets */}
      {pastBooklets.length > 0 && (
        <View className="px-6 mt-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Past Booklets
          </Text>
          {pastBooklets.map((booklet) => (
            <CardPressable
              key={booklet.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-3 border border-gray-100 dark:border-gray-700"
              onPress={() => router.push(`/booklet/${booklet.id}`)}
            >
              <Text className="font-medium text-gray-700 dark:text-gray-300">
                {booklet.label}
              </Text>
              {booklet.actualDeliveryDate && (
                <Text className="text-gray-400 text-sm">
                  Delivered: {formatDate(booklet.actualDeliveryDate)}
                </Text>
              )}
            </CardPressable>
          ))}
        </View>
      )}

      {/* Today's Medications Reminder */}
      <View className="px-6 mt-8 mb-8">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Medications
        </Text>
        {pendingMeds.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No medications"
            description="Prescribed medications will appear here"
          />
        ) : (
          pendingMeds.slice(0, 3).map((med) => (
            <View
              key={med.id}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 mb-3"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    {med.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">{med.dosage}</Text>
                </View>
                <View className="border border-amber-400 px-3 py-1 rounded-full">
                  <Text className="text-amber-600 dark:text-amber-400 text-sm">
                    {med.todayLogs.filter((l) => l.status === "taken").length}/
                    {med.frequencyPerDay} taken
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
