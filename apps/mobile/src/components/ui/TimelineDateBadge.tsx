import { View, Text } from "react-native";

interface TimelineDateBadgeProps {
  date: Date | string;
  isActive?: boolean;
}

export function TimelineDateBadge({ date, isActive = false }: TimelineDateBadgeProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const day = dateObj.getDate();
  const month = dateObj
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();

  if (isActive) {
    return (
      <View className="bg-blue-500 rounded-xl w-14 h-14 items-center justify-center shadow-lg z-10">
        <Text className="text-[10px] uppercase font-bold text-blue-200 leading-none mb-0.5">
          {month}
        </Text>
        <Text className="text-xl font-bold text-white leading-none">{day}</Text>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl w-14 h-14 items-center justify-center shadow-sm z-10">
      <Text className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 opacity-70 leading-none mb-0.5">
        {month}
      </Text>
      <Text className="text-xl font-bold text-gray-500 dark:text-gray-400 leading-none">
        {day}
      </Text>
    </View>
  );
}
