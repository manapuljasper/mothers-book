import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore, useBookletStore, useMedicationStore } from "../../../src/stores";
import { FREQUENCY_LABELS } from "../../../src/types";

export default function MedicationsScreen() {
  const { motherProfile, currentUser } = useAuthStore();
  const { getBookletsByMother } = useBookletStore();
  const { getActiveMedications, logIntake } = useMedicationStore();

  const booklets = motherProfile ? getBookletsByMother(motherProfile.id) : [];
  const bookletIds = booklets.map((b) => b.id);

  // Get all active medications for mother's booklets
  const activeMedications = getActiveMedications().filter((m) =>
    bookletIds.includes(m.bookletId)
  );

  const handleToggleDose = (medicationId: string, doseIndex: number, currentStatus: string) => {
    if (!currentUser) return;

    const newStatus = currentStatus === "taken" ? "missed" : "taken";
    logIntake(medicationId, doseIndex, newStatus, currentUser.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Medications</Text>
        <Text className="text-gray-500 text-sm">
          Track your daily medication intake
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {activeMedications.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">💊</Text>
            <Text className="text-gray-500 text-center">
              No active medications
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Your doctor will prescribe medications during your checkups
            </Text>
          </View>
        ) : (
          activeMedications.map((med) => {
            const booklet = booklets.find((b) => b.id === med.bookletId);
            const takenCount = med.todayLogs.filter((l) => l.status === "taken").length;

            return (
              <View
                key={med.id}
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
                  <View
                    className={`px-3 py-1 rounded-full ${
                      takenCount === med.frequencyPerDay
                        ? "bg-green-100"
                        : "bg-amber-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        takenCount === med.frequencyPerDay
                          ? "text-green-700"
                          : "text-amber-700"
                      }`}
                    >
                      {takenCount}/{med.frequencyPerDay}
                    </Text>
                  </View>
                </View>

                {/* Instructions */}
                <Text className="text-gray-500 text-sm mb-4">
                  {med.instructions}
                </Text>

                {/* Dose Tracker */}
                <View className="flex-row border-t border-gray-100 pt-3">
                  {Array.from({ length: med.frequencyPerDay }).map((_, index) => {
                    const log = med.todayLogs.find((l) => l.doseIndex === index);
                    const isTaken = log?.status === "taken";
                    const time = med.timesOfDay?.[index] || `Dose ${index + 1}`;

                    return (
                      <Pressable
                        key={index}
                        className={`flex-1 mx-1 py-3 rounded-lg items-center ${
                          isTaken
                            ? "bg-green-100 border-2 border-green-500"
                            : "bg-gray-100 border-2 border-gray-200"
                        }`}
                        onPress={() =>
                          handleToggleDose(med.id, index, log?.status || "")
                        }
                      >
                        <Text
                          className={`text-lg ${isTaken ? "text-green-600" : "text-gray-400"}`}
                        >
                          {isTaken ? "✓" : "○"}
                        </Text>
                        <Text
                          className={`text-xs mt-1 ${
                            isTaken ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {time}
                        </Text>
                      </Pressable>
                    );
                  })}
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
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
