import { View, Text } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { CardPressable } from "./AnimatedPressable";
import { formatDate, formatRelativeDate } from "../../utils";
import type { MotherBooklet, BookletWithMother } from "../../types";

interface BookletCardProps {
  booklet: MotherBooklet | BookletWithMother;
  onPress: () => void;
  variant?: "mother" | "doctor";
  /** Whether this card is selected (for master-detail pattern) */
  selected?: boolean;
}

const statusColors = {
  active: {
    border: "border-green-400",
    text: "text-green-600 dark:text-green-400",
  },
  completed: {
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-500 dark:text-gray-400",
  },
  archived: {
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-500 dark:text-gray-400",
  },
};

export function BookletCard({
  booklet,
  onPress,
  variant = "mother",
  selected = false,
}: BookletCardProps) {
  const colors = statusColors[booklet.status] || statusColors.active;
  const isDoctor = variant === "doctor";
  const hasMotherName = "motherName" in booklet;

  // Selected state styling (for master-detail)
  const selectedBorder = selected
    ? "border-blue-500 dark:border-blue-400"
    : "border-gray-100 dark:border-gray-700";
  const selectedBg = selected
    ? "bg-blue-50 dark:bg-blue-900/20"
    : "bg-white dark:bg-gray-800";

  return (
    <CardPressable
      className={`${selectedBg} rounded-xl p-5 mb-3 border ${selectedBorder}`}
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 dark:text-white text-lg">
            {isDoctor && hasMotherName
              ? (booklet as BookletWithMother).motherName
              : booklet.label}
          </Text>
          {isDoctor && hasMotherName ? (
            <Text className="text-gray-400">{booklet.label}</Text>
          ) : (
            booklet.expectedDueDate && (
              <Text className="text-pink-500 text-sm mt-1">
                Due: {formatDate(booklet.expectedDueDate)}
              </Text>
            )
          )}
        </View>
        <View className="flex-row items-center gap-2">
          {/* Risk Level Badge */}
          {booklet.currentRiskLevel && (
            <View
              className={`flex-row items-center px-2 py-1 rounded-full ${
                booklet.currentRiskLevel === "high"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-emerald-100 dark:bg-emerald-900/30"
              }`}
            >
              {booklet.currentRiskLevel === "high" && (
                <AlertTriangle size={10} color="#ef4444" strokeWidth={2.5} style={{ marginRight: 3 }} />
              )}
              <Text
                className={`text-xs font-bold ${
                  booklet.currentRiskLevel === "high"
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {booklet.currentRiskLevel === "high" ? "HR" : "LR"}
              </Text>
            </View>
          )}
          {/* Status Badge */}
          <View className={`border ${colors.border} px-2 py-1 rounded-full`}>
            <Text className={`text-xs font-medium ${colors.text}`}>
              {booklet.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Additional info for doctor view */}
      {isDoctor && hasMotherName && (
        <View className="flex-row mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <View className="flex-1">
            <Text className="text-gray-300 dark:text-gray-500 text-xs">
              Last Visit
            </Text>
            <Text className="text-gray-600 dark:text-gray-300 text-sm">
              {(booklet as BookletWithMother).lastVisitDate
                ? formatRelativeDate(
                    (booklet as BookletWithMother).lastVisitDate!
                  )
                : "—"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-300 dark:text-gray-500 text-xs">
              Next Appointment
            </Text>
            <Text className="text-gray-600 dark:text-gray-300 text-sm">
              {(booklet as BookletWithMother).nextAppointment
                ? formatRelativeDate(
                    (booklet as BookletWithMother).nextAppointment!
                  )
                : "—"}
            </Text>
          </View>
        </View>
      )}

      {/* Notes for mother view */}
      {!isDoctor && booklet.notes && (
        <Text
          className="text-gray-400 text-sm mt-2"
          numberOfLines={2}
        >
          {booklet.notes}
        </Text>
      )}
    </CardPressable>
  );
}
