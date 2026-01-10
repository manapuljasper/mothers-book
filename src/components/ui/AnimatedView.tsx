import { ViewProps } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  SlideInRight,
  ZoomIn,
} from "react-native-reanimated";
import { ReactNode } from "react";

interface AnimatedViewProps extends ViewProps {
  children: ReactNode;
  className?: string;
  // Entry animation
  entering?: "fade" | "fadeDown" | "fadeUp" | "slideRight" | "zoom" | "none";
  // Delay for staggered lists
  delay?: number;
  // Layout animation for size changes
  layout?: boolean;
}

export function AnimatedView({
  children,
  className,
  entering = "fade",
  delay = 0,
  layout = false,
  style,
  ...props
}: AnimatedViewProps) {
  const getEnteringAnimation = () => {
    switch (entering) {
      case "fade":
        return FadeIn.delay(delay).duration(300);
      case "fadeDown":
        return FadeInDown.delay(delay).damping(15);
      case "fadeUp":
        return FadeInUp.delay(delay).damping(15);
      case "slideRight":
        return SlideInRight.delay(delay).damping(15);
      case "zoom":
        return ZoomIn.delay(delay).damping(15);
      case "none":
        return undefined;
      default:
        return FadeIn.delay(delay).duration(300);
    }
  };

  return (
    <Animated.View
      className={className}
      style={style}
      entering={getEnteringAnimation()}
      layout={layout ? Layout.springify().damping(15) : undefined}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

// Counter animation for stats
interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  return (
    <Animated.Text className={className} entering={ZoomIn.damping(12)}>
      {value}
    </Animated.Text>
  );
}
