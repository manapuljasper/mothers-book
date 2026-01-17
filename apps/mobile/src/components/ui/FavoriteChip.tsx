import { Text, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FavoriteChipProps {
  label: string;
  onPress: () => void;
  color?: "green" | "blue" | "amber";
  disabled?: boolean;
}

const colorClasses = {
  green: {
    bg: "bg-green-50 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-700",
    text: "text-green-700 dark:text-green-300",
    iconColor: "#22c55e",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-300",
    iconColor: "#3b82f6",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-300",
    iconColor: "#f59e0b",
  },
};

export function FavoriteChip({
  label,
  onPress,
  color = "green",
  disabled = false,
}: FavoriteChipProps) {
  const scale = useSharedValue(1);
  const colors = colorClasses[color];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={animatedStyle}
      className={`flex-row items-center px-3 py-2 rounded-full border mr-2 mb-2 ${colors.bg} ${colors.border} ${disabled ? "opacity-50" : ""}`}
    >
      <Plus size={14} color={colors.iconColor} strokeWidth={2} />
      <Text className={`ml-1.5 text-sm font-medium ${colors.text}`}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
