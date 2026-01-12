import { View, Text, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";

interface VitalCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function VitalCard({
  label,
  value,
  unit,
  icon: Icon,
  iconColor = "#f43f5e", // rose-500 default
}: VitalCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Icon size={18} color={iconColor} strokeWidth={1.5} />
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b", // slate-800
    padding: 16,
    borderRadius: 16,
    height: 110,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8", // slate-400
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  unit: {
    fontSize: 12,
    color: "#94a3b8", // slate-400
    marginLeft: 4,
  },
});
