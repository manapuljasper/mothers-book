import React from "react";
import { View } from "react-native";
import { SkeletonBox } from "./SkeletonBox";

interface SkeletonTimelineEntryCardProps {
  /** Expanded shows vitals grid, compact shows inline icons */
  variant?: "expanded" | "compact";
}

function SkeletonVitalsGridItem() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-2 items-center border border-gray-100 dark:border-slate-700/50">
      {/* Label */}
      <SkeletonBox
        width={28}
        height={10}
        borderRadius={2}
        style={{ marginBottom: 4 }}
      />
      {/* Value */}
      <SkeletonBox width={36} height={14} borderRadius={2} />
    </View>
  );
}

export function SkeletonTimelineEntryCard({
  variant = "compact",
}: SkeletonTimelineEntryCardProps) {
  return (
    <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
      {/* Header Row */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          {/* Entry type title */}
          <SkeletonBox
            width={140}
            height={18}
            borderRadius={4}
            style={{ marginBottom: 6 }}
          />
          {/* Doctor name + time */}
          <SkeletonBox width={120} height={12} borderRadius={3} />
        </View>
        {/* Chevron placeholder */}
        <SkeletonBox width={20} height={20} borderRadius={4} />
      </View>

      {/* Vitals Display */}
      {variant === "expanded" && (
        <View className="flex-row gap-2 mb-3">
          <SkeletonVitalsGridItem />
          <SkeletonVitalsGridItem />
          <SkeletonVitalsGridItem />
        </View>
      )}

      {/* Compact Vitals Display */}
      {variant === "compact" && (
        <View className="flex-row items-center gap-4">
          {/* BP */}
          <View className="flex-row items-center gap-1.5">
            <SkeletonBox width={14} height={14} borderRadius={2} />
            <SkeletonBox width={50} height={14} borderRadius={3} />
          </View>
          {/* Weight */}
          <View className="flex-row items-center gap-1.5">
            <SkeletonBox width={14} height={14} borderRadius={2} />
            <SkeletonBox width={36} height={14} borderRadius={3} />
          </View>
          {/* AOG */}
          <View className="flex-row items-center gap-1.5">
            <SkeletonBox width={14} height={14} borderRadius={2} />
            <SkeletonBox width={32} height={14} borderRadius={3} />
          </View>
        </View>
      )}

      {/* Footer Row */}
      <View className="flex-row items-center gap-2 mt-2">
        {/* Follow-up badge */}
        <SkeletonBox width={100} height={18} borderRadius={4} />
        <View className="flex-1" />
        {/* Icons */}
        <SkeletonBox width={14} height={14} borderRadius={2} />
        <SkeletonBox width={14} height={14} borderRadius={2} />
      </View>
    </View>
  );
}
