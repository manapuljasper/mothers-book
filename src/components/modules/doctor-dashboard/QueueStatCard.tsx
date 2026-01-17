import { View, Text } from "react-native";

interface QueueStatCardProps {
  value: number | string;
  label: string;
}

export function QueueStatCard({ value, label }: QueueStatCardProps) {
  return (
    <View className="flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-[#1c2431] p-4 border border-gray-200 dark:border-slate-800">
      <Text className="text-3xl font-bold text-doctor-500 tracking-tight">
        {value}
      </Text>
      <Text className="text-xs font-medium text-gray-500 dark:text-slate-400 leading-snug">
        {label}
      </Text>
    </View>
  );
}
