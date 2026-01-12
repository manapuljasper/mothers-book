import { View, Text, StyleSheet } from "react-native";
import { Quote } from "lucide-react-native";

interface InstructionsCardProps {
  instructions: string;
}

export function InstructionsCard({ instructions }: InstructionsCardProps) {
  if (!instructions || !instructions.trim()) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Background quote decoration */}
      <View style={styles.quoteDecoration}>
        <Quote size={96} color="#92400e" strokeWidth={1} />
      </View>

      <Text style={styles.text}>{instructions}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2c2214", // warm amber-dark
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(146, 64, 14, 0.3)", // amber-900/30
    position: "relative",
    overflow: "hidden",
  },
  quoteDecoration: {
    position: "absolute",
    right: -16,
    top: -16,
    opacity: 0.07,
    transform: [{ rotate: "12deg" }],
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fef3c7", // amber-100
    lineHeight: 28,
  },
});
