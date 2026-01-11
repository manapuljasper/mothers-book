import { View, Text } from "react-native";

type StatusType = "active" | "pending" | "completed" | "ended" | "cancelled";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  /**
   * Use light variant for badges on colored backgrounds (e.g., colored headers)
   */
  light?: boolean;
}

const STATUS_STYLES: Record<StatusType, { border: string; text: string; lightBorder: string; lightText: string }> = {
  active: {
    border: "border-green-400",
    text: "text-green-600 dark:text-green-400",
    lightBorder: "border-white/50",
    lightText: "text-white",
  },
  pending: {
    border: "border-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    lightBorder: "border-white/50",
    lightText: "text-white",
  },
  completed: {
    border: "border-green-400",
    text: "text-green-600 dark:text-green-400",
    lightBorder: "border-white/50",
    lightText: "text-white",
  },
  ended: {
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-500 dark:text-gray-400",
    lightBorder: "border-white/30",
    lightText: "text-white/70",
  },
  cancelled: {
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-500 dark:text-gray-400",
    lightBorder: "border-white/30",
    lightText: "text-white/70",
  },
};

const DEFAULT_LABELS: Record<StatusType, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  ended: "Ended",
  cancelled: "Cancelled",
};

export function StatusBadge({ status, label, light = false }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  const displayLabel = label ?? DEFAULT_LABELS[status];

  const borderClass = light ? style.lightBorder : style.border;
  const textClass = light ? style.lightText : style.text;

  return (
    <View className={`px-2 py-1 rounded-full border ${borderClass}`}>
      <Text className={`text-xs font-medium ${textClass}`}>{displayLabel}</Text>
    </View>
  );
}
