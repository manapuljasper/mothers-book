import { ReactNode } from "react";
import { Text, ActivityIndicator, View } from "react-native";
import { AnimatedPressable } from "./AnimatedPressable";
import { LucideIcon } from "lucide-react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "indigo";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: ReactNode;
  onPress: () => void;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { container: string; text: string; iconColor: string; disabledContainer: string; disabledText: string }
> = {
  primary: {
    container: "bg-blue-500",
    text: "text-white",
    iconColor: "#ffffff",
    disabledContainer: "bg-blue-300",
    disabledText: "text-white",
  },
  secondary: {
    container: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-700 dark:text-gray-200",
    iconColor: "#374151",
    disabledContainer: "bg-gray-100 dark:bg-gray-800",
    disabledText: "text-gray-400 dark:text-gray-500",
  },
  outline: {
    container: "bg-transparent border border-blue-500 dark:border-blue-400",
    text: "text-blue-500 dark:text-blue-400",
    iconColor: "#3b82f6",
    disabledContainer: "bg-transparent border border-gray-300 dark:border-gray-600",
    disabledText: "text-gray-400 dark:text-gray-500",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-blue-500 dark:text-blue-400",
    iconColor: "#3b82f6",
    disabledContainer: "bg-transparent",
    disabledText: "text-gray-400 dark:text-gray-500",
  },
  danger: {
    container: "bg-red-500",
    text: "text-white",
    iconColor: "#ffffff",
    disabledContainer: "bg-red-300",
    disabledText: "text-white",
  },
  indigo: {
    container: "bg-indigo-600",
    text: "text-white",
    iconColor: "#ffffff",
    disabledContainer: "bg-indigo-300",
    disabledText: "text-white",
  },
};

const SIZE_STYLES: Record<ButtonSize, { container: string; text: string; iconSize: number }> = {
  sm: {
    container: "py-2 px-3",
    text: "text-sm",
    iconSize: 16,
  },
  md: {
    container: "py-3 px-4",
    text: "text-base",
    iconSize: 18,
  },
  lg: {
    container: "py-4 px-6",
    text: "text-lg",
    iconSize: 20,
  },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  onPress,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const containerClasses = `
    ${isDisabled ? variantStyle.disabledContainer : variantStyle.container}
    ${sizeStyle.container}
    rounded-lg
    flex-row
    items-center
    justify-center
    ${fullWidth ? "w-full" : ""}
  `.trim();

  const textClasses = `
    ${isDisabled ? variantStyle.disabledText : variantStyle.text}
    ${sizeStyle.text}
    font-semibold
  `.trim();

  const iconColor = isDisabled ? "#9ca3af" : variantStyle.iconColor;

  return (
    <AnimatedPressable
      className={containerClasses}
      onPress={onPress}
      disabled={isDisabled}
      scaleValue={0.96}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={["secondary", "outline", "ghost"].includes(variant) ? "#6b7280" : "#ffffff"}
        />
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <View className="mr-2">
              <Icon size={sizeStyle.iconSize} color={iconColor} strokeWidth={2} />
            </View>
          )}
          <Text className={textClasses}>{children}</Text>
          {Icon && iconPosition === "right" && (
            <View className="ml-2">
              <Icon size={sizeStyle.iconSize} color={iconColor} strokeWidth={2} />
            </View>
          )}
        </>
      )}
    </AnimatedPressable>
  );
}
