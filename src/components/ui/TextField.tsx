import { forwardRef } from "react";
import { View, Text, TextInput, TextInputProps, Pressable } from "react-native";
import { useThemeStore } from "../../stores";
import { LucideIcon } from "lucide-react-native";

type TextFieldSize = "sm" | "md";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconPress?: () => void;
  size?: TextFieldSize;
  containerClassName?: string;
}

const SIZE_STYLES: Record<TextFieldSize, { input: string; label: string; iconSize: number }> = {
  sm: {
    input: "px-3 py-2 text-sm",
    label: "text-xs text-gray-400 dark:text-gray-500 mb-1",
    iconSize: 16,
  },
  md: {
    input: "px-4 py-3 text-base",
    label: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
    iconSize: 18,
  },
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    {
      label,
      required,
      helperText,
      error,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconPress,
      size = "md",
      containerClassName = "",
      editable = true,
      ...textInputProps
    },
    ref
  ) => {
    const { colorScheme } = useThemeStore();
    const isDark = colorScheme === "dark";
    const sizeStyle = SIZE_STYLES[size];

    const hasError = !!error;
    const isDisabled = editable === false;

    const borderClass = hasError
      ? "border-red-500 dark:border-red-400"
      : "border-gray-300 dark:border-gray-600";

    const inputClasses = `
      border
      ${borderClass}
      rounded-lg
      ${sizeStyle.input}
      text-gray-900
      dark:text-white
      bg-white
      dark:bg-gray-800
      ${LeftIcon ? "pl-10" : ""}
      ${RightIcon ? "pr-10" : ""}
      ${isDisabled ? "opacity-50" : ""}
    `.trim();

    const placeholderColor = isDark ? "#6b7280" : "#9ca3af";
    const iconColor = hasError ? "#ef4444" : "#9ca3af";

    return (
      <View className={containerClassName}>
        {label && (
          <Text className={sizeStyle.label}>
            {label}
            {required && <Text className="text-red-500"> *</Text>}
          </Text>
        )}

        <View className="relative">
          {LeftIcon && (
            <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
              <LeftIcon size={sizeStyle.iconSize} color={iconColor} strokeWidth={1.5} />
            </View>
          )}

          <TextInput
            ref={ref}
            className={inputClasses}
            placeholderTextColor={placeholderColor}
            editable={editable}
            style={{
              textAlignVertical: "center",
              lineHeight: size === "sm" ? 14 : 16,
            }}
            {...textInputProps}
          />

          {RightIcon && (
            <Pressable
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              className="absolute right-3 top-0 bottom-0 justify-center z-10"
            >
              <RightIcon size={sizeStyle.iconSize} color={iconColor} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>

        {(helperText || error) && (
          <Text
            className={`text-xs mt-1 ${
              hasError ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

TextField.displayName = "TextField";
