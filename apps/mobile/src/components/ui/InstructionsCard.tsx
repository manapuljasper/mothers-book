import { View, Text, useColorScheme } from "react-native";
import { Quote } from "lucide-react-native";

interface InstructionsCardProps {
  instructions: string;
}

export function InstructionsCard({ instructions }: InstructionsCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!instructions || !instructions.trim()) {
    return null;
  }

  const colors = {
    background: isDark ? "#2c2214" : "#fffbeb", // warm amber-dark / amber-50
    border: isDark ? "rgba(146, 64, 14, 0.3)" : "#fde68a", // amber-900/30 / amber-200
    quoteIcon: isDark ? "#92400e" : "#d97706", // amber-800 / amber-600
    text: isDark ? "#fef3c7" : "#78350f", // amber-100 / amber-900
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background quote decoration */}
      <View
        style={{
          position: "absolute",
          right: -16,
          top: -16,
          opacity: 0.07,
          transform: [{ rotate: "12deg" }],
        }}
      >
        <Quote size={96} color={colors.quoteIcon} strokeWidth={1} />
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "500",
          color: colors.text,
          lineHeight: 28,
        }}
      >
        {instructions}
      </Text>
    </View>
  );
}
