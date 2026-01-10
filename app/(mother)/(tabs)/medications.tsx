import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAuthStore,
  useBookletStore,
  useMedicationStore,
} from "../../../src/stores";
import { FREQUENCY_LABELS } from "../../../src/types";
import { AnimatedView, DoseButton } from "../../../src/components/ui";

export default function MedicationsScreen() {
  const { motherProfile, currentUser } = useAuthStore();
  const { getBookletsByMother } = useBookletStore();
  const { getActiveMedications, logIntake } = useMedicationStore();

  const booklets = motherProfile ? getBookletsByMother(motherProfile.id) : [];
  const bookletIds = booklets.map((b) => b.id);

  const activeMedications = getActiveMedications().filter((m) =>
    bookletIds.includes(m.bookletId)
  );

  const handleToggleDose = (
    medicationId: string,
    doseIndex: number,
    currentStatus: string
  ) => {
    if (!currentUser) return;

    const newStatus = currentStatus === "taken" ? "missed" : "taken";
    logIntake(medicationId, doseIndex, newStatus, currentUser.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <AnimatedView
        entering="fade"
        className="bg-white px-6 py-4 border-b border-gray-200"
      >
        <Text className="text-2xl font-bold text-gray-900">Medications</Text>
        <Text className="text-gray-500 text-sm">
          Track your daily medication intake
        </Text>
      </AnimatedView>

      <ScrollView className="flex-1 px-6 py-4">
        {activeMedications.length === 0 ? (
          <AnimatedView
            entering="fadeUp"
            delay={100}
            className="items-center py-12"
          >
            <Text className="text-6xl mb-4">💊</Text>
            <Text className="text-gray-500 text-center">
              No active medications
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Your doctor will prescribe medications during your checkups
            </Text>
          </AnimatedView>
        ) : (
          activeMedications.map((med, medIndex) => {
            const booklet = booklets.find((b) => b.id === med.bookletId);
            const takenCount = med.todayLogs.filter(
              (l) => l.status === "taken"
            ).length;
            const isComplete = takenCount === med.frequencyPerDay;

            return (
              <AnimatedView
                key={med.id}
                layout
                className="bg-white rounded-xl p-4 mb-4 shadow-sm"
              >
                {/* Medication Info */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-lg">
                      {med.name}
                    </Text>
                    <Text className="text-gray-600">{med.dosage}</Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {booklet?.label}
                    </Text>
                  </View>
                  <AnimatedView
                    layout
                    className={`px-3 py-1 rounded-full ${
                      isComplete ? "bg-green-100" : "bg-amber-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isComplete ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {takenCount}/{med.frequencyPerDay}
                    </Text>
                  </AnimatedView>
                </View>

                {/* Instructions */}
                <Text className="text-gray-500 text-sm mb-4">
                  {med.instructions}
                </Text>

                {/* Dose Tracker with animated buttons */}
                <View className="flex-row border-t border-gray-100 pt-3">
                  {Array.from({ length: med.frequencyPerDay }).map(
                    (_, index) => {
                      const log = med.todayLogs.find(
                        (l) => l.doseIndex === index
                      );
                      const isTaken = log?.status === "taken";
                      const time =
                        med.timesOfDay?.[index] || `Dose ${index + 1}`;

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
                    }
                  )}
                </View>

                {/* Adherence */}
                <View className="mt-4 pt-3 border-t border-gray-100">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">
                      {FREQUENCY_LABELS[med.frequencyPerDay]}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {med.adherenceRate}% adherence (7 days)
                    </Text>
                  </View>
                </View>
              </AnimatedView>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
