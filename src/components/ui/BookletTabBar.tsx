import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { History, Pill, FlaskConical } from "lucide-react-native";

export type BookletTab = "history" | "meds" | "labs";

interface BookletTabBarProps {
  activeTab: BookletTab;
  onTabChange: (tab: BookletTab) => void;
}

export function BookletTabBar({ activeTab, onTabChange }: BookletTabBarProps) {
  const handlePress = (tab: BookletTab) => {
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      {/* History Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handlePress("history")}
        style={[
          styles.tab,
          activeTab === "history" && styles.activeTab,
        ]}
      >
        <History
          size={18}
          color={activeTab === "history" ? "#ffffff" : "#9ca3af"}
          strokeWidth={1.5}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "history" && styles.activeTabText,
          ]}
        >
          History
        </Text>
      </TouchableOpacity>

      {/* Meds Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handlePress("meds")}
        style={[
          styles.tab,
          activeTab === "meds" && styles.activeTab,
        ]}
      >
        <Pill
          size={18}
          color={activeTab === "meds" ? "#ffffff" : "#9ca3af"}
          strokeWidth={1.5}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "meds" && styles.activeTabText,
          ]}
        >
          Meds
        </Text>
      </TouchableOpacity>

      {/* Labs Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handlePress("labs")}
        style={[
          styles.tab,
          activeTab === "labs" && styles.activeTab,
        ]}
      >
        <FlaskConical
          size={18}
          color={activeTab === "labs" ? "#ffffff" : "#9ca3af"}
          strokeWidth={1.5}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "labs" && styles.activeTabText,
          ]}
        >
          Labs
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b", // slate-800
    padding: 6,
    borderRadius: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.6)", // slate-700/60
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#3b82f6", // blue-500
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9ca3af", // gray-400
  },
  activeTabText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
