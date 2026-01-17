import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { History, Pill, FlaskConical } from "lucide-react-native";

export type BookletTab = "history" | "meds" | "labs";

interface BookletTabBarProps {
  activeTab: BookletTab;
  onTabChange: (tab: BookletTab) => void;
}

export function BookletTabBar({ activeTab, onTabChange }: BookletTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePress = (tab: BookletTab) => {
    onTabChange(tab);
  };

  const containerStyle = {
    backgroundColor: isDark ? "#1e293b" : "#f3f4f6", // slate-800 / gray-100
    padding: 6,
    borderRadius: 16,
    flexDirection: "row" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDark ? "rgba(71, 85, 105, 0.6)" : "#e5e7eb", // slate-700/60 / gray-200
  };

  const tabStyle = {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "#3b82f6", // blue-500
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  };

  const inactiveColor = isDark ? "#9ca3af" : "#6b7280"; // gray-400 / gray-500

  return (
    <View style={containerStyle}>
      {/* History Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handlePress("history")}
        style={activeTab === "history" ? activeTabStyle : tabStyle}
      >
        <History
          size={18}
          color={activeTab === "history" ? "#ffffff" : inactiveColor}
          strokeWidth={1.5}
        />
        <Text
          style={{
            fontSize: 14,
            fontWeight: activeTab === "history" ? "600" : "500",
            color: activeTab === "history" ? "#ffffff" : inactiveColor,
          }}
        >
          History
        </Text>
      </TouchableOpacity>

      {/* Meds Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handlePress("meds")}
        style={activeTab === "meds" ? activeTabStyle : tabStyle}
      >
        <Pill
          size={18}
          color={activeTab === "meds" ? "#ffffff" : inactiveColor}
          strokeWidth={1.5}
        />
        <Text
          style={{
            fontSize: 14,
            fontWeight: activeTab === "meds" ? "600" : "500",
            color: activeTab === "meds" ? "#ffffff" : inactiveColor,
          }}
        >
          Meds
        </Text>
      </TouchableOpacity>

      {/* Labs Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handlePress("labs")}
        style={activeTab === "labs" ? activeTabStyle : tabStyle}
      >
        <FlaskConical
          size={18}
          color={activeTab === "labs" ? "#ffffff" : inactiveColor}
          strokeWidth={1.5}
        />
        <Text
          style={{
            fontSize: 14,
            fontWeight: activeTab === "labs" ? "600" : "500",
            color: activeTab === "labs" ? "#ffffff" : inactiveColor,
          }}
        >
          Labs
        </Text>
      </TouchableOpacity>
    </View>
  );
}
