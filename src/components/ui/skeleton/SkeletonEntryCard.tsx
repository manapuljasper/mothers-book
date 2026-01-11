import React from "react";
import { View } from "react-native";
import { SkeletonBox } from "./SkeletonBox";

export function SkeletonEntryCard() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
      {/* Header: entry type + doctor + date badge */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <SkeletonBox width="50%" height={22} borderRadius={4} />
          <View className="mt-1">
            <SkeletonBox width="30%" height={16} borderRadius={4} />
          </View>
        </View>
        <SkeletonBox width={80} height={26} borderRadius={13} />
      </View>

      {/* Vitals grid placeholder */}
      <View className="flex-row flex-wrap mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="mr-4 mb-2">
            <SkeletonBox width={30} height={12} borderRadius={2} />
            <View className="mt-1">
              <SkeletonBox width={50} height={16} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>

      {/* Notes placeholder */}
      <View className="mt-3">
        <SkeletonBox width="100%" height={16} borderRadius={4} />
        <View className="mt-1">
          <SkeletonBox width="80%" height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}
