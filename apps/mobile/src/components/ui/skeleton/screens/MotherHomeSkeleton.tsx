import React from "react";
import { View, ScrollView } from "react-native";
import { SkeletonProvider } from "../SkeletonContext";
import { SkeletonBox } from "../SkeletonBox";
import { SkeletonStatCard } from "../SkeletonStatCard";
import { SkeletonBookletCard } from "../SkeletonBookletCard";

function MotherHomeSkeletonContent() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Quick Stats */}
      <View className="flex-row px-4 pt-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </View>

      {/* My Booklets */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <SkeletonBox width={100} height={22} borderRadius={4} />
          <SkeletonBox width={50} height={18} borderRadius={4} />
        </View>
        <SkeletonBookletCard variant="mother" />
        <SkeletonBookletCard variant="mother" />
      </View>

      {/* Today's Medications */}
      <View className="px-6 mt-8 mb-8">
        <SkeletonBox width={160} height={22} borderRadius={4} />
        <View className="mt-4">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 mb-3"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <SkeletonBox width={120} height={18} borderRadius={4} />
                  <View className="mt-1">
                    <SkeletonBox width={80} height={14} borderRadius={4} />
                  </View>
                </View>
                <SkeletonBox width={70} height={26} borderRadius={13} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export function MotherHomeSkeleton() {
  return (
    <SkeletonProvider>
      <MotherHomeSkeletonContent />
    </SkeletonProvider>
  );
}
