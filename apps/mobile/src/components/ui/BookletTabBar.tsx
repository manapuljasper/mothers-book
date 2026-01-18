import { View, Text, TouchableOpacity, useColorScheme } from "react-native";

export type BookletTab = "history" | "medical" | "meds" | "labs";

interface BookletTabBarProps {
  activeTab: BookletTab;
  onTabChange: (tab: BookletTab) => void;
}

const TABS: { key: BookletTab; label: string }[] = [
  { key: "history", label: "History" },
  { key: "medical", label: "Medical" },
  { key: "meds", label: "Meds" },
  { key: "labs", label: "Labs" },
];

export function BookletTabBar({ activeTab, onTabChange }: BookletTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const inactiveColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <View
      style={{
        backgroundColor: isDark ? "#1e293b" : "#f3f4f6",
        padding: 4,
        borderRadius: 14,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: isDark ? "rgba(71, 85, 105, 0.6)" : "#e5e7eb",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              ...(isActive && {
                backgroundColor: "#3b82f6",
              }),
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#ffffff" : inactiveColor,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
