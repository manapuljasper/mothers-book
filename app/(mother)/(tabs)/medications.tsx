import { useState } from "react";
import { View, Text, ScrollView, Alert, RefreshControl } from "react-native";
import { useAuthStore } from "@/stores";
import {
  useBookletsByMother,
  useActiveMedications,
  useLogIntake,
} from "@/hooks";
import { FREQUENCY_LABELS } from "@/types";
import { AnimatedView, DoseButton, MedicationsSkeleton } from "@/components/ui";

export default function MedicationsScreen() {
  const { motherProfile, currentUser } = useAuthStore();

  const { data: booklets = [], isLoading: bookletLoading, refetch: refetchBooklets } =
    useBookletsByMother(motherProfile?.id);
  const { data: allActiveMedications = [], isLoading: medsLoading, refetch: refetchMedications } =
    useActiveMedications();
  const logIntakeMutation = useLogIntake();

  const isLoading = bookletLoading || medsLoading;

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBooklets(), refetchMedications()]);
    setRefreshing(false);
  };

  const bookletIds = booklets.map((b) => b.id);

  // Filter medications to only those belonging to this mother's booklets
  const activeMedications = allActiveMedications.filter((m) =>
    bookletIds.includes(m.bookletId)
  );

  const handleToggleDose = async (
    medicationId: string,
    doseIndex: number,
    currentStatus: string
  ) => {
    if (!currentUser) return;

    const newStatus = currentStatus === "taken" ? "missed" : "taken";
    try {
      await logIntakeMutation.mutateAsync({
        medicationId,
        doseIndex,
        status: newStatus,
        userId: currentUser.id,
      });
    } catch (error) {
      // UI already rolled back via optimistic update onError
      Alert.alert("Error", "Failed to update medication status");
    }
  };

  if (isLoading) {
    return <MedicationsSkeleton />;
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900 px-6 py-4"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ec4899"
        />
      }
    >
      {activeMedications.length === 0 ? (
        <AnimatedView
          entering="fadeUp"
          delay={100}
          className="items-center py-12"
        >
          <Text className="text-6xl mb-4">💊</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            No active medications
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-2">
            Your doctor will prescribe medications during your checkups
          </Text>
        </AnimatedView>
      ) : (
        activeMedications.map((med) => {
          const booklet = booklets.find((b) => b.id === med.bookletId);
          const takenCount =
            med.todayLogs?.filter((l) => l.status === "taken").length || 0;
          const isComplete = takenCount === med.frequencyPerDay;

          return (
            <AnimatedView
              key={med.id}
              layout
              className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700"
            >
              {/* Medication Info */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white text-lg">
                    {med.name}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-300">
                    {med.dosage}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    {booklet?.label}
                  </Text>
                </View>
                <AnimatedView
                  layout
                  className={`px-3 py-1 rounded-full ${
                    isComplete
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-amber-100 dark:bg-amber-900"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isComplete
                        ? "text-green-700 dark:text-green-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {takenCount}/{med.frequencyPerDay}
                  </Text>
                </AnimatedView>
              </View>

              {/* Instructions */}
              {med.instructions && (
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {med.instructions}
                </Text>
              )}

              {/* Dose Tracker with animated buttons */}
              <View className="flex-row border-t border-gray-100 dark:border-gray-700 pt-3">
                {Array.from({ length: med.frequencyPerDay }).map((_, index) => {
                  const log = med.todayLogs?.find((l) => l.doseIndex === index);
                  const isTaken = log?.status === "taken";
                  const time = med.timesOfDay?.[index] || `Dose ${index + 1}`;

                  return (
                    <DoseButton
                      key={index}
                      isTaken={isTaken}
                      time={time}
                      onToggle={() =>
                        handleToggleDose(med.id, index, log?.status || "")
                      }
                    />
                  );
                })}
              </View>

              {/* Adherence */}
              <View className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {FREQUENCY_LABELS[med.frequencyPerDay]}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {med.adherenceRate || 0}% adherence (7 days)
                  </Text>
                </View>
              </View>
            </AnimatedView>
          );
        })
      )}
    </ScrollView>
  );
}
