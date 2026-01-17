import React from "react";
import { View } from "react-native";
import { SkeletonBox } from "./SkeletonBox";

interface SkeletonMedicationCardProps {
  variant?: "card" | "inline";
  showDates?: boolean;
  showInstructions?: boolean;
}

export function SkeletonMedicationCard({
  variant = "card",
  showDates = true,
  showInstructions = false,
}: SkeletonMedicationCardProps) {
  const containerClasses =
    variant === "card"
      ? "bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
      : "border border-gray-100 dark:border-gray-700 rounded-lg p-3";

  return (
    <View className={containerClasses}>
      {/* Header: name + dosage + badge */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <SkeletonBox width="60%" height={18} borderRadius={4} />
          <View className="mt-1">
            <SkeletonBox width="40%" height={14} borderRadius={4} />
          </View>
        </View>
        <SkeletonBox width={54} height={22} borderRadius={11} />
      </View>

      {/* Dates row */}
      {showDates && (
        <View className="flex-row mt-2">
          <SkeletonBox width={100} height={12} borderRadius={2} />
          <View className="ml-3">
            <SkeletonBox width={80} height={12} borderRadius={2} />
          </View>
        </View>
      )}

      {/* Instructions */}
      {showInstructions && (
        <View className="mt-2">
          <SkeletonBox width="90%" height={14} borderRadius={4} />
        </View>
      )}
    </View>
  );
}
