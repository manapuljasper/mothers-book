import { View, Text, useColorScheme } from "react-native";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#1e293b" : "#f8fafc",
    border: isDark ? "rgba(255, 255, 255, 0.05)" : "#e2e8f0",
    label: isDark ? "#94a3b8" : "#64748b",
    value: isDark ? "#ffffff" : "#0f172a",
    unit: isDark ? "#94a3b8" : "#64748b",
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 16,
        height: 110,
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: colors.label,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <Icon size={18} color={iconColor} strokeWidth={1.5} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: colors.value }}>
          {value}
        </Text>
        {unit && (
          <Text style={{ fontSize: 12, color: colors.unit, marginLeft: 4 }}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}
