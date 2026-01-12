import { View, Text } from "react-native";

interface AOGBadgeProps {
  /** Age of gestation, e.g., "28w" or "28 weeks" */
  aog: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export function AOGBadge({ aog, size = "md" }: AOGBadgeProps) {
  // Format AOG to short form if needed (e.g., "28 weeks" -> "28w")
  const shortAOG = aog
    .replace(/\s*weeks?/i, "w")
    .replace(/\s*days?/i, "d")
    .replace(/\s+/g, "");

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <View
      className={`${sizeClasses[size]} bg-white/20 rounded-full items-center justify-center border border-white/10`}
      style={{
        // Glassmorphism effect - backdrop blur doesn't work well in RN, so we use opacity
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <Text className={`${textClasses[size]} font-bold text-white`}>
        {shortAOG}
      </Text>
    </View>
  );
}
