import { View, Text } from "react-native";
import { Check, Circle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import type { MedicationWithLogs } from "../../types";
import { FREQUENCY_LABELS } from "../../types";
import { AnimatedPressable } from "./AnimatedPressable";

interface MedicationDoseCardProps {
  medication: MedicationWithLogs;
  bookletLabel?: string;
  onToggleDose: (doseIndex: number, currentlyTaken: boolean) => void;
}

export function MedicationDoseCard({
  medication,
  bookletLabel,
  onToggleDose,
}: MedicationDoseCardProps) {
  const { name, dosage, frequencyPerDay, todayLogs, adherenceRate } = medication;

  // Calculate taken count
  const takenCount = todayLogs?.filter((l) => l.status === "taken").length ?? 0;
  const isComplete = takenCount >= frequencyPerDay;

  // Build dose buttons array
  const doses = Array.from({ length: frequencyPerDay }, (_, i) => {
    const log = todayLogs?.find((l) => l.doseIndex === i);
    return {
      index: i,
      isTaken: log?.status === "taken",
    };
  });

  const handleDosePress = (index: number, isTaken: boolean) => {
    // Haptic feedback
    if (!isTaken) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleDose(index, isTaken);
  };

  return (
    <View className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {dosage}
            </Text>
            {bookletLabel && (
              <>
                <Text className="text-gray-400 dark:text-gray-500 mx-2">•</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {bookletLabel}
                </Text>
              </>
            )}
          </View>
        </View>
        <View
          className={`px-2 py-1 rounded-md border ${
            isComplete
              ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800"
              : "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              isComplete
                ? "text-green-600 dark:text-green-400"
                : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {takenCount}/{frequencyPerDay}
          </Text>
        </View>
      </View>

      {/* Dose Buttons Grid */}
      <View className="flex-row gap-3 mb-4">
        {doses.map((dose) => (
          <AnimatedPressable
            key={dose.index}
            onPress={() => handleDosePress(dose.index, dose.isTaken)}
            className={`flex-1 py-3 rounded-xl items-center justify-center border ${
              dose.isTaken
                ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            }`}
          >
            {dose.isTaken ? (
              <Check size={20} color="#22c55e" strokeWidth={2.5} />
            ) : (
              <Circle size={20} color="#d1d5db" strokeWidth={1.5} />
            )}
            <Text
              className={`text-xs font-semibold mt-1 ${
                dose.isTaken
                  ? "text-green-700 dark:text-green-300"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Dose {dose.index + 1}
            </Text>
          </AnimatedPressable>
        ))}
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {FREQUENCY_LABELS[frequencyPerDay]}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {Math.round(adherenceRate)}% adherence (7 days)
        </Text>
      </View>
    </View>
  );
}
