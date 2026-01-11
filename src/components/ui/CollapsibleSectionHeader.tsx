import { View, Text, Pressable } from "react-native";
import { ChevronUp, ChevronDown, LucideIcon } from "lucide-react-native";

interface CollapsibleSectionHeaderProps {
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  icon?: LucideIcon;
  /**
   * Size variant
   * - "sm": Smaller text (xs), used inside cards
   * - "md": Larger text (base), used as section headers
   */
  size?: "sm" | "md";
}

export function CollapsibleSectionHeader({
  title,
  count,
  expanded,
  onToggle,
  icon: Icon,
  size = "sm",
}: CollapsibleSectionHeaderProps) {
  const isSmall = size === "sm";

  const titleClasses = isSmall
    ? "text-xs font-semibold text-gray-400 uppercase tracking-wide"
    : "text-lg font-semibold text-gray-900 dark:text-white";

  const iconSize = isSmall ? 16 : 20;
  const iconColor = isSmall ? "#9ca3af" : "#6b7280";
  const ChevronIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row justify-between items-center"
    >
      <View className="flex-row items-center flex-1">
        {Icon && (
          <View className="mr-2">
            <Icon size={isSmall ? 16 : 18} color={iconColor} strokeWidth={1.5} />
          </View>
        )}
        <Text className={titleClasses}>
          {title}
          {count !== undefined && ` (${count})`}
        </Text>
      </View>
      <ChevronIcon size={iconSize} color={iconColor} strokeWidth={1.5} />
    </Pressable>
  );
}
