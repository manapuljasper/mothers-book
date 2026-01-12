import { View, Text, Pressable } from "react-native";
import { History, Pill, FlaskConical } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

export type BookletTab = "history" | "meds" | "labs";

interface TabItem {
  key: BookletTab;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { key: "history", label: "History", icon: History },
  { key: "meds", label: "Meds", icon: Pill },
  { key: "labs", label: "Labs", icon: FlaskConical },
];

interface BookletTabBarProps {
  activeTab: BookletTab;
  onTabChange: (tab: BookletTab) => void;
}

export function BookletTabBar({ activeTab, onTabChange }: BookletTabBarProps) {
  return (
    <View className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700/60 flex-row">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${
              isActive ? "bg-blue-500 shadow-md" : ""
            }`}
          >
            <Icon
              size={18}
              color={isActive ? "#ffffff" : "#9ca3af"}
              strokeWidth={1.5}
            />
            <Text
              className={`text-sm font-medium ${
                isActive
                  ? "text-white font-semibold"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
