import { Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { AnimatedPressable } from "./AnimatedPressable";

interface DoseButtonProps {
  isTaken: boolean;
  time: string;
  onToggle: () => void;
}

export function DoseButton({ isTaken, time, onToggle }: DoseButtonProps) {
  const handlePress = () => {
    // Haptic feedback - success for taking, light for untaking
    if (!isTaken) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onToggle();
  };

  return (
    <AnimatedPressable
      className={`flex-1 mx-1 py-3 rounded-lg items-center ${
        isTaken
          ? "bg-green-100 border-2 border-green-500"
          : "bg-gray-100 border-2 border-gray-200"
      }`}
      onPress={handlePress}
    >
      <View className="h-6 justify-center">
        <Text
          className={`text-lg ${isTaken ? "text-green-600" : "text-gray-400"}`}
        >
          {isTaken ? "✓" : "○"}
        </Text>
      </View>
      <Text
        className={`text-xs mt-1 ${
          isTaken ? "text-green-700" : "text-gray-500"
        }`}
      >
        {time}
      </Text>
    </AnimatedPressable>
  );
}
