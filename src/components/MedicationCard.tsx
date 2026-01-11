import { View, Text } from "react-native";
import { Medication } from "../types";
import { formatDate } from "../utils";
import { StatusBadge } from "./ui";

interface MedicationCardProps {
  medication: Medication;
  /**
   * Variant determines the card appearance:
   * - "card": Full card with border and padding (for lists)
   * - "inline": Compact version without outer card styling (for use inside other cards)
   */
  variant?: "card" | "inline";
  /**
   * Show the prescribed/until dates
   */
  showDates?: boolean;
  /**
   * Optional action buttons to render in the header (e.g., edit/stop buttons)
   */
  headerAction?: React.ReactNode;
}

export function MedicationCard({
  medication,
  variant = "card",
  showDates = true,
  headerAction,
}: MedicationCardProps) {
  const isActive =
    medication.isActive &&
    (!medication.endDate || new Date(medication.endDate) >= new Date());

  const containerClasses =
    variant === "card"
      ? "bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
      : "border border-gray-100 dark:border-gray-700 rounded-lg p-3";

  return (
    <View className={containerClasses}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="font-medium text-gray-900 dark:text-white">
            {medication.name}
          </Text>
          <Text className="text-gray-400 text-sm">
            {medication.dosage} • {medication.frequencyPerDay}x daily
          </Text>
        </View>
        {headerAction || <StatusBadge status={isActive ? "active" : "ended"} />}
      </View>

      {showDates && (
        <View className="flex-row mt-2 flex-wrap">
          <Text className="text-gray-400 text-xs mr-3">
            Prescribed: {formatDate(medication.startDate)}
          </Text>
          {medication.endDate && (
            <Text className="text-gray-400 text-xs">
              Until: {formatDate(medication.endDate)}
            </Text>
          )}
        </View>
      )}

      {medication.instructions && (
        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          {medication.instructions}
        </Text>
      )}
    </View>
  );
}
