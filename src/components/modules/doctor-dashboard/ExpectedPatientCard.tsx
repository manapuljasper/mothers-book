import { View, Text } from "react-native";
import { ListItemPressable } from "@/components/ui";

interface PatientCardProps {
  patientName: string;
  visitReason: string;
  queueNumber: string;
  onPress?: () => void;
  /** Optional opacity for later queue items */
  faded?: boolean;
}

export function PatientCard({
  patientName,
  visitReason,
  queueNumber,
  onPress,
  faded = false,
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
        <Text className="text-sm text-gray-500 dark:text-slate-400">
          {visitReason}
        </Text>
      </View>

      {/* Indicator dot */}
      <View className="h-2 w-2 rounded-full bg-gray-200 dark:bg-slate-700" />
    </ListItemPressable>
  );
}
