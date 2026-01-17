import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";

type StatusType = "active" | "pending" | "completed" | "ended" | "cancelled" | "archived";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  /**
   * Use light variant for badges on colored backgrounds (e.g., colored headers)
   */
  light?: boolean;
  /**
   * Show a pulsing dot indicator (useful for active status)
   */
  showDot?: boolean;
  /**
   * Use glassmorphism style (semi-transparent background)
   */
  glassmorphism?: boolean;
}

const STATUS_STYLES: Record<
  StatusType,
  {
    border: string;
    text: string;
    lightBorder: string;
    lightText: string;
    dotColor: string;
    glassBg: string;
    glassBorder: string;
  }
> = {
  active: {
    border: "border-green-400",
    text: "text-green-600 dark:text-green-400",
    lightBorder: "border-white/50",
    lightText: "text-white",
    dotColor: "bg-emerald-400",
    glassBg: "bg-emerald-500/20",
    glassBorder: "border-emerald-400/30",
  },
  pending: {
    border: "border-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    lightBorder: "border-white/50",
    lightText: "text-white",
    dotColor: "bg-amber-400",
    glassBg: "bg-amber-500/20",
    glassBorder: "border-amber-400/30",
  },
  completed: {
    border: "border-green-400",
    text: "text-green-600 dark:text-green-400",
    lightBorder: "border-white/50",
    lightText: "text-white",
    dotColor: "bg-green-400",
    glassBg: "bg-green-500/20",
    glassBorder: "border-green-400/30",
  },
  ended: {
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-500 dark:text-gray-400",
    lightBorder: "border-white/30",
    lightText: "text-white/70",
    dotColor: "bg-gray-400",
    glassBg: "bg-gray-500/20",
    glassBorder: "border-gray-400/30",
  },
  cancelled: {
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-500 dark:text-gray-400",
    lightBorder: "border-white/30",
    lightText: "text-white/70",
    dotColor: "bg-gray-400",
    glassBg: "bg-gray-500/20",
    glassBorder: "border-gray-400/30",
  },
  archived: {
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-500 dark:text-gray-400",
    lightBorder: "border-white/30",
    lightText: "text-white/70",
    dotColor: "bg-gray-400",
    glassBg: "bg-gray-500/20",
    glassBorder: "border-gray-400/30",
  },
};

const DEFAULT_LABELS: Record<StatusType, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  ended: "Ended",
  cancelled: "Cancelled",
  archived: "Archived",
};

function PulsingDot({ colorClass }: { colorClass: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`w-1.5 h-1.5 rounded-full ${colorClass}`}
    />
  );
}

export function StatusBadge({
  status,
  label,
  light = false,
  showDot = false,
  glassmorphism = false,
}: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  const displayLabel = label ?? DEFAULT_LABELS[status];

  if (glassmorphism) {
    return (
      <View
        className={`px-3 py-1 rounded-full border ${style.glassBg} ${style.glassBorder} flex-row items-center gap-1.5`}
      >
        {showDot && <PulsingDot colorClass={style.dotColor} />}
        <Text className="text-xs font-bold text-white uppercase tracking-wide">
          {displayLabel}
        </Text>
      </View>
    );
  }

  const borderClass = light ? style.lightBorder : style.border;
  const textClass = light ? style.lightText : style.text;

  return (
    <View
      className={`px-2 py-1 rounded-full border ${borderClass} flex-row items-center gap-1.5`}
    >
      {showDot && <PulsingDot colorClass={style.dotColor} />}
      <Text className={`text-xs font-medium ${textClass}`}>{displayLabel}</Text>
    </View>
  );
}
