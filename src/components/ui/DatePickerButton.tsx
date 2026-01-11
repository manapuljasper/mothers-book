import { View, Text, Pressable } from "react-native";
import { Calendar, X } from "lucide-react-native";
import { formatDate } from "../../utils";

interface DatePickerButtonProps {
  /**
   * The selected date (null/undefined means no date selected)
   */
  value: Date | null | undefined;
  /**
   * Called when the button is pressed to open the date picker
   */
  onPress: () => void;
  /**
   * Called when the clear button is pressed
   */
  onClear?: () => void;
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string;
  /**
   * Optional label to show above the button
   */
  label?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Variant style
   * - "default": Standard gray border
   * - "selected": Blue/green border when selected
   */
  variant?: "default" | "selected";
  /**
   * Color when variant is "selected"
   */
  selectedColor?: "blue" | "green" | "pink";
  /**
   * Size variant
   */
  size?: "sm" | "md";
}

export function DatePickerButton({
  value,
  onPress,
  onClear,
  placeholder = "Select date",
  label,
  required,
  variant = "default",
  selectedColor = "blue",
  size = "md",
}: DatePickerButtonProps) {
  const hasValue = value != null;
  const showSelectedStyle = variant === "selected" && hasValue;

  const sizeClasses = size === "sm" ? "px-3 py-2" : "px-4 py-3";
  const textSizeClass = size === "sm" ? "text-sm" : "text-base";
  const iconSize = size === "sm" ? 16 : 18;

  // Border color based on variant and selection state
  let borderClass = "border-gray-200 dark:border-gray-700";
  let bgClass = "bg-white dark:bg-gray-800";

  if (showSelectedStyle) {
    if (selectedColor === "blue") {
      borderClass = "border-blue-400";
      bgClass = "bg-blue-50 dark:bg-blue-900/30";
    } else if (selectedColor === "green") {
      borderClass = "border-green-400";
      bgClass = "bg-green-50 dark:bg-green-900/30";
    } else if (selectedColor === "pink") {
      borderClass = "border-pink-400";
      bgClass = "bg-pink-50 dark:bg-pink-900/30";
    }
  }

  // Text/icon color
  let textClass = "text-gray-400";
  let iconColor = "#9ca3af";

  if (hasValue) {
    if (showSelectedStyle && selectedColor === "blue") {
      textClass = "text-blue-600 dark:text-blue-400 font-medium";
      iconColor = "#3b82f6";
    } else if (showSelectedStyle && selectedColor === "green") {
      textClass = "text-green-600 dark:text-green-400 font-medium";
      iconColor = "#22c55e";
    } else {
      textClass = "text-gray-900 dark:text-white";
      iconColor = "#6b7280";
    }
  }

  return (
    <View>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}
      <Pressable
        onPress={onPress}
        className={`flex-row items-center ${bgClass} border ${borderClass} rounded-lg ${sizeClasses}`}
      >
        <Calendar size={iconSize} color={iconColor} strokeWidth={1.5} />
        <Text className={`${textClass} ${textSizeClass} ml-3 flex-1`}>
          {hasValue ? formatDate(value) : placeholder}
        </Text>
        {hasValue && onClear && (
          <Pressable onPress={onClear} className="p-1" hitSlop={8}>
            <X size={16} color="#9ca3af" strokeWidth={1.5} />
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}
