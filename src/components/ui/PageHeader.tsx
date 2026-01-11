import { ReactNode } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { CardPressable } from "./AnimatedPressable";
import { StatusBadge } from "./StatusBadge";

type HeaderColor = "blue" | "pink";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * Color theme for the header
   */
  color?: HeaderColor;
  /**
   * Optional status badge to show
   */
  status?: "active" | "completed" | "pending" | "ended" | "cancelled";
  /**
   * Additional info to show next to the status badge
   */
  additionalInfo?: string;
  /**
   * Custom back button handler. If not provided, uses router.back()
   */
  onBack?: () => void;
  /**
   * Optional children to render below the title area
   */
  children?: ReactNode;
}

const COLOR_STYLES: Record<
  HeaderColor,
  { bg: string; backText: string; subtitle: string; backIcon: string }
> = {
  blue: {
    bg: "bg-blue-500",
    backText: "text-blue-200",
    subtitle: "text-blue-200",
    backIcon: "#bfdbfe",
  },
  pink: {
    bg: "bg-pink-500",
    backText: "text-pink-200",
    subtitle: "text-pink-200",
    backIcon: "#fbcfe8",
  },
};

export function PageHeader({
  title,
  subtitle,
  color = "blue",
  status,
  additionalInfo,
  onBack,
  children,
}: PageHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = COLOR_STYLES[color];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className={`${styles.bg} px-6 py-6`} style={{ paddingTop: insets.top }}>
      <CardPressable onPress={handleBack} className="flex-row items-center mb-3">
        <ChevronLeft size={20} color={styles.backIcon} strokeWidth={1.5} />
        <Text className={`${styles.backText} ml-1`}>Back</Text>
      </CardPressable>

      <Text className="text-white text-2xl font-bold">{title}</Text>
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}

      {(status || additionalInfo) && (
        <View className="flex-row items-center mt-2">
          {status && <StatusBadge status={status} light />}
          {additionalInfo && (
            <Text className={`${styles.subtitle} ml-3`}>{additionalInfo}</Text>
          )}
        </View>
      )}

      {children}
    </View>
  );
}
