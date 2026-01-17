import { View, Text } from "react-native";
import { LabRequest, LAB_STATUS_LABELS } from "../types";
import { formatDate } from "../utils";
import { StatusBadge } from "./ui";

interface LabRequestCardProps {
  lab: LabRequest;
  /**
   * Variant determines the card appearance:
   * - "card": Full card with border and padding (for lists)
   * - "inline": Compact version without outer card styling (for use inside other cards)
   */
  variant?: "card" | "inline";
  /**
   * Show the requested/completed dates
   */
  showDates?: boolean;
  /**
   * Optional action to render at the bottom of the card
   */
  action?: React.ReactNode;
}

// Priority badge styling helper
function getPriorityBadgeClasses(priority: string | undefined) {
  switch (priority) {
    case "urgent":
      return {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        border: "border-amber-200 dark:border-amber-700",
        text: "text-amber-700 dark:text-amber-300",
      };
    case "stat":
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        border: "border-red-200 dark:border-red-700",
        text: "text-red-700 dark:text-red-300",
      };
    default:
      return null; // Don't show badge for routine
  }
}

export function LabRequestCard({
  lab,
  variant = "card",
  showDates = true,
  action,
}: LabRequestCardProps) {
  const containerClasses =
    variant === "card"
      ? "bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
      : "border border-gray-100 dark:border-gray-700 rounded-lg p-3";

  // Map lab status to StatusBadge status
  const badgeStatus =
    lab.status === "completed"
      ? "completed"
      : lab.status === "pending"
      ? "pending"
      : "cancelled";

  // Priority badge classes (only for urgent/stat)
  const priorityClasses = getPriorityBadgeClasses(lab.priority);

  return (
    <View className={containerClasses}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center">
            <Text className="font-medium text-gray-900 dark:text-white">
              {lab.description}
            </Text>
            {priorityClasses && (
              <View className={`ml-2 px-2 py-0.5 rounded border ${priorityClasses.bg} ${priorityClasses.border}`}>
                <Text className={`text-xs font-medium ${priorityClasses.text}`}>
                  {lab.priority?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
        <StatusBadge status={badgeStatus} label={LAB_STATUS_LABELS[lab.status]} />
      </View>

      {showDates && (
        <View className="flex-row mt-2 flex-wrap">
          <Text className="text-gray-400 text-xs mr-3">
            Requested: {formatDate(lab.requestedDate)}
          </Text>
          {lab.dueDate && (
            <Text className="text-blue-500 dark:text-blue-400 text-xs mr-3">
              Due: {formatDate(lab.dueDate)}
            </Text>
          )}
          {lab.completedDate && (
            <Text className="text-gray-400 text-xs">
              Completed: {formatDate(lab.completedDate)}
            </Text>
          )}
        </View>
      )}

      {lab.results && (
        <View className="mt-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
          <Text className="text-green-700 dark:text-green-400 text-sm">
            {lab.results}
          </Text>
        </View>
      )}

      {lab.notes && !lab.results && (
        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          {lab.notes}
        </Text>
      )}

      {action && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {action}
        </View>
      )}
    </View>
  );
}
