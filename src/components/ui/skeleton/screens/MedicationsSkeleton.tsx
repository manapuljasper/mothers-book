import React from "react";
import { View, ScrollView } from "react-native";
import { SkeletonProvider } from "../SkeletonContext";
import { SkeletonBox } from "../SkeletonBox";

function MedicationsSkeletonContent() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-6 py-4">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700"
        >
          {/* Medication Info */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <SkeletonBox width="60%" height={22} borderRadius={4} />
              <View className="mt-1">
                <SkeletonBox width="40%" height={18} borderRadius={4} />
              </View>
              <View className="mt-1">
                <SkeletonBox width={80} height={12} borderRadius={4} />
              </View>
            </View>
            <SkeletonBox width={50} height={26} borderRadius={13} />
          </View>

          {/* Instructions placeholder */}
          <View className="mb-4">
            <SkeletonBox width="80%" height={14} borderRadius={4} />
          </View>

          {/* Dose Tracker */}
          <View className="flex-row border-t border-gray-100 dark:border-gray-700 pt-3">
            {[1, 2, 3].map((j) => (
              <View key={j} className="flex-1 items-center mr-2">
                <SkeletonBox width={48} height={48} borderRadius={24} />
                <View className="mt-1">
                  <SkeletonBox width={40} height={12} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>

          {/* Adherence */}
          <View className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between">
              <SkeletonBox width={100} height={14} borderRadius={4} />
              <SkeletonBox width={120} height={14} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export function MedicationsSkeleton() {
  return (
    <SkeletonProvider>
      <MedicationsSkeletonContent />
    </SkeletonProvider>
  );
}
