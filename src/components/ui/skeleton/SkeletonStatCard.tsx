import React from "react";
import { View } from "react-native";
import { SkeletonBox } from "./SkeletonBox";

interface SkeletonStatCardProps {
  size?: "sm" | "md";
}

export function SkeletonStatCard({ size = "md" }: SkeletonStatCardProps) {
  const valueHeight = size === "sm" ? 24 : 30;

  return (
    <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 mx-1 border border-gray-100 dark:border-gray-700">
      <SkeletonBox width={60} height={valueHeight} borderRadius={4} />
      <View className="mt-2">
        <SkeletonBox width={80} height={16} borderRadius={4} />
      </View>
    </View>
  );
}
