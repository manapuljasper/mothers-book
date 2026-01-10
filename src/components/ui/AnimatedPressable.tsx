import {
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { ReactNode } from "react";

interface AnimatedPressableProps
  extends Omit<TouchableWithoutFeedbackProps, "style"> {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
  scaleValue?: number;
}

export function AnimatedPressable({
  children,
  className,
  style,
  scaleValue = 0.95,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(scaleValue, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      {...props}
    >
      <Animated.View className={className} style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// Specialized variants
export function CardPressable(props: AnimatedPressableProps) {
  return <AnimatedPressable scaleValue={0.98} {...props} />;
}

export function ButtonPressable(props: AnimatedPressableProps) {
  return <AnimatedPressable scaleValue={0.96} {...props} />;
}

export function ListItemPressable(props: AnimatedPressableProps) {
  return <AnimatedPressable scaleValue={0.99} {...props} />;
}
