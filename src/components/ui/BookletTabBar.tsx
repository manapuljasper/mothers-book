import { View, Text, TouchableOpacity } from "react-native";
import { History, Pill, FlaskConical } from "lucide-react-native";

export type BookletTab = "history" | "meds" | "labs";

interface BookletTabBarProps {
  activeTab: BookletTab;
  onTabChange: (tab: BookletTab) => void;
}

export function BookletTabBar({ activeTab, onTabChange }: BookletTabBarProps) {
  return (
    <View className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700/60 flex-row">
      {/* History Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onTabChange("history")}
        className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${
          activeTab === "history" ? "bg-blue-500 shadow-md" : ""
        }`}
      >
        <History
          size={18}
          color={activeTab === "history" ? "#ffffff" : "#9ca3af"}
          strokeWidth={1.5}
        />
        <Text
          className={`text-sm font-medium ${
            activeTab === "history"
              ? "text-white font-semibold"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          History
        </Text>
      </TouchableOpacity>

      {/* Meds Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onTabChange("meds")}
        className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${
          activeTab === "meds" ? "bg-blue-500 shadow-md" : ""
        }`}
      >
        <Pill
          size={18}
          color={activeTab === "meds" ? "#ffffff" : "#9ca3af"}
          strokeWidth={1.5}
        />
        <Text
          className={`text-sm font-medium ${
            activeTab === "meds"
              ? "text-white font-semibold"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Meds
        </Text>
      </TouchableOpacity>

      {/* Labs Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onTabChange("labs")}
        className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${
          activeTab === "labs" ? "bg-blue-500 shadow-md" : ""
        }`}
      >
        <FlaskConical
          size={18}
          color={activeTab === "labs" ? "#ffffff" : "#9ca3af"}
          strokeWidth={1.5}
        />
        <Text
          className={`text-sm font-medium ${
            activeTab === "labs"
              ? "text-white font-semibold"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Labs
        </Text>
      </TouchableOpacity>
    </View>
  );
}
