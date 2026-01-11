import { View, ActivityIndicator } from "react-native";

interface LoadingScreenProps {
  /**
   * Color of the loading indicator
   * @default "#3b82f6" (blue-500)
   */
  color?: string;
}

export function LoadingScreen({ color = "#3b82f6" }: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}
