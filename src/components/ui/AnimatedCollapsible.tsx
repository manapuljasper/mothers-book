import { useEffect, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface AnimatedCollapsibleProps {
  expanded: boolean;
  children: React.ReactNode;
  duration?: number;
}

export function AnimatedCollapsible({
  expanded,
  children,
  duration = 200,
}: AnimatedCollapsibleProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(expanded ? contentHeight : 0, { duration });
  }, [expanded, contentHeight, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: "hidden",
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    if (measuredHeight > 0 && measuredHeight !== contentHeight) {
      setContentHeight(measuredHeight);
      // If initially expanded, set height immediately
      if (expanded) {
        height.value = measuredHeight;
      }
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Animated.View
        style={{ position: "absolute", width: "100%" }}
        onLayout={onLayout}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}
