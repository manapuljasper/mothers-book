import React from "react";
import { View, StyleSheet, ViewStyle, DimensionValue } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "../../../stores";
import { useSkeletonAnimation } from "./SkeletonContext";

interface SkeletonBoxProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({
  width,
  height,
  borderRadius = 4,
  style,
}: SkeletonBoxProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const progress = useSkeletonAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 100 }],
  }));

  // Colors for light/dark mode
  const baseColor = isDark ? "#374151" : "#e5e7eb"; // gray-700 / gray-200
  const shimmerColor = isDark ? "#4b5563" : "#f3f4f6"; // gray-600 / gray-100

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[baseColor, shimmerColor, baseColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { width: "200%" }]}
        />
      </Animated.View>
    </View>
  );
}
