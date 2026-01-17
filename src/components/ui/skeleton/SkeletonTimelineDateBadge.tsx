import React from "react";
import { View } from "react-native";
import { SkeletonBox } from "./SkeletonBox";

interface SkeletonTimelineDateBadgeProps {
  /** Whether this represents an active (selected) date badge */
  isActive?: boolean;
}

export function SkeletonTimelineDateBadge({
  isActive = false,
}: SkeletonTimelineDateBadgeProps) {
  if (isActive) {
    return (
      <View className="bg-blue-500 rounded-xl w-14 h-14 items-center justify-center shadow-lg z-10">
        {/* Month placeholder */}
        <SkeletonBox
          width={24}
          height={10}
          borderRadius={2}
          style={{ opacity: 0.4, marginBottom: 4 }}
        />
        {/* Day number placeholder */}
        <SkeletonBox
          width={20}
          height={16}
          borderRadius={2}
          style={{ opacity: 0.5 }}
        />
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl w-14 h-14 items-center justify-center shadow-sm z-10">
      {/* Month placeholder */}
      <SkeletonBox
        width={24}
        height={10}
        borderRadius={2}
        style={{ marginBottom: 4 }}
      />
      {/* Day number placeholder */}
      <SkeletonBox width={20} height={16} borderRadius={2} />
    </View>
  );
}
