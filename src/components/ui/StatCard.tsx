import { View, Text } from "react-native";

interface StatCardProps {
  value: number | string;
  label: string;
  color?: "pink" | "blue" | "amber" | "green" | "purple";
  size?: "sm" | "md";
}

const colorClasses = {
  pink: "text-pink-500",
  blue: "text-blue-500",
  amber: "text-amber-500",
  green: "text-green-500",
  purple: "text-purple-500",
};

export function StatCard({
  value,
  label,
  color = "pink",
  size = "md",
}: StatCardProps) {
  const valueSize = size === "sm" ? "text-2xl" : "text-3xl";
  const labelSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 mx-1 border border-gray-100 dark:border-gray-700">
      <Text className={`${valueSize} font-bold ${colorClasses[color]}`}>
        {value}
      </Text>
      <Text className={`text-gray-400 ${labelSize}`}>{label}</Text>
    </View>
  );
}
