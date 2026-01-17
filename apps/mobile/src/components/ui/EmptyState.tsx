import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { CardPressable } from "./AnimatedPressable";

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBgClassName?: string;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  size?: "small" | "medium";
}

export function EmptyState({
  icon: Icon,
  iconColor = "#9ca3af",
  iconBgClassName = "bg-gray-100 dark:bg-gray-700",
  title,
  description,
  action,
  size = "medium",
}: EmptyStateProps) {
  const isSmall = size === "small";
  const iconContainerSize = isSmall ? "w-12 h-12" : "w-14 h-14";
  const iconSize = isSmall ? 24 : 28;
  const titleSize = isSmall ? "text-base" : "text-lg";
  const padding = isSmall ? "p-6" : "p-8";

  return (
    <View
      className={`bg-white dark:bg-gray-800 rounded-xl ${padding} border border-gray-100 dark:border-gray-700 items-center`}
    >
      <View
        className={`${iconContainerSize} ${iconBgClassName} rounded-full items-center justify-center mb-4`}
      >
        <Icon size={iconSize} color={iconColor} strokeWidth={1.5} />
      </View>

      <Text
        className={`${titleSize} font-medium text-gray-700 dark:text-gray-300 text-center mb-1`}
      >
        {title}
      </Text>

      {description && (
        <Text className="text-gray-400 dark:text-gray-500 text-sm text-center">
          {description}
        </Text>
      )}

      {action && (
        <CardPressable
          className="bg-blue-500 rounded-xl px-5 py-3 flex-row items-center mt-4"
          onPress={action.onPress}
        >
          {action.icon && (
            <action.icon size={18} color="white" strokeWidth={1.5} />
          )}
          <Text
            className={`text-white font-semibold ${action.icon ? "ml-2" : ""}`}
          >
            {action.label}
          </Text>
        </CardPressable>
      )}
    </View>
  );
}
