import { View, Text } from "react-native";

interface AOGBadgeProps {
  /** Age of gestation, e.g., "28w" or "28 weeks" */
  aog: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
  sm: { minWidth: 40, height: 40, padding: 8 },
  md: { minWidth: 48, height: 48, padding: 10 },
  lg: { minWidth: 56, height: 56, padding: 12 },
};

export function AOGBadge({ aog, size = "md" }: AOGBadgeProps) {
  // Format AOG to short form with space between weeks and days
  // e.g., "28 weeks 4 days" -> "28w 4d", "28weeks4days" -> "28w 4d"
  const shortAOG = aog
    .replace(/\s*weeks?\s*/i, "w ")
    .replace(/\s*days?/i, "d")
    .trim();

  const textClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const config = SIZE_CONFIG[size];
  const isLongText = shortAOG.length > 4;

  return (
    <View
      className="bg-white/20 items-center justify-center border border-white/10"
      style={{
        minWidth: config.minWidth,
        height: config.height,
        paddingHorizontal: isLongText ? config.padding : 0,
        borderRadius: config.height / 2,
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
