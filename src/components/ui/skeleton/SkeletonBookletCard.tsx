import React from "react";
import { View } from "react-native";
import { SkeletonBox } from "./SkeletonBox";

interface SkeletonBookletCardProps {
  variant?: "mother" | "doctor";
}

export function SkeletonBookletCard({
  variant = "mother",
}: SkeletonBookletCardProps) {
  const isDoctor = variant === "doctor";

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-3 border border-gray-100 dark:border-gray-700">
      {/* Header row with title and badge */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <SkeletonBox width="70%" height={22} borderRadius={4} />
          <View className="mt-2">
            <SkeletonBox width="50%" height={16} borderRadius={4} />
          </View>
        </View>
        <SkeletonBox width={60} height={24} borderRadius={12} />
      </View>

      {/* Doctor variant: extra info row */}
      {isDoctor && (
        <View className="flex-row mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <View className="flex-1">
            <SkeletonBox width={60} height={12} borderRadius={2} />
            <View className="mt-1">
              <SkeletonBox width={80} height={16} borderRadius={4} />
            </View>
          </View>
          <View className="flex-1">
            <SkeletonBox width={80} height={12} borderRadius={2} />
            <View className="mt-1">
              <SkeletonBox width={70} height={16} borderRadius={4} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
