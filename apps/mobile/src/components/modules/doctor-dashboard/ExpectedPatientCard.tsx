import { View, Text } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { ListItemPressable } from "@/components/ui";
import type { RiskLevel } from "@/types";

interface PatientCardProps {
  patientName: string;
  visitReason: string;
  queueNumber: string;
  onPress?: () => void;
  /** Optional opacity for later queue items */
  faded?: boolean;
  /** Risk level indicator */
  riskLevel?: RiskLevel;
  /** Time when patient was seen (for done patients) */
  completedTime?: string;
}

export function PatientCard({
  patientName,
  visitReason,
  queueNumber,
  onPress,
  faded = false,
  riskLevel,
  completedTime,
}: PatientCardProps) {
  const containerOpacity = faded ? "opacity-80" : "";

  return (
    <ListItemPressable
      onPress={onPress}
      className={`flex-row items-center gap-4 rounded-xl bg-white dark:bg-[#1c2431] p-4 border border-gray-200 dark:border-slate-800 ${containerOpacity}`}
    >
      {/* Left section - Queue number */}
      <View className="flex-col items-center justify-center min-w-[48px]">
        <Text className="text-lg font-bold text-doctor-500">
          {queueNumber}
        </Text>
      </View>

      {/* Divider */}
      <View className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700" />

      {/* Patient info */}
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900 dark:text-slate-100">
          {patientName}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-sm text-gray-500 dark:text-slate-400">
            {visitReason}
          </Text>
          {completedTime && (
            <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {completedTime}
            </Text>
          )}
        </View>
      </View>

      {/* Risk Level Badge or Indicator dot */}
      {riskLevel ? (
        <View
          className={`flex-row items-center px-2 py-1 rounded-full ${
            riskLevel === "high"
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-emerald-100 dark:bg-emerald-900/30"
          }`}
        >
          {riskLevel === "high" && (
            <AlertTriangle size={10} color="#ef4444" strokeWidth={2.5} style={{ marginRight: 3 }} />
          )}
          <Text
            className={`text-xs font-bold ${
              riskLevel === "high"
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {riskLevel === "high" ? "HR" : "LR"}
          </Text>
        </View>
      ) : (
        <View className="h-2 w-2 rounded-full bg-gray-200 dark:bg-slate-700" />
      )}
    </ListItemPressable>
  );
}
