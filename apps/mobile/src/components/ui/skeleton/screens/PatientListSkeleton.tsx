import React from "react";
import { View, ScrollView } from "react-native";
import { SkeletonProvider } from "../SkeletonContext";
import { SkeletonBox } from "../SkeletonBox";
import { SkeletonBookletCard } from "../SkeletonBookletCard";

function PatientListSkeletonContent() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search */}
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-600">
          <SkeletonBox width={18} height={18} borderRadius={4} />
          <View className="ml-2 flex-1">
            <SkeletonBox width="60%" height={18} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Patient List */}
      <ScrollView className="flex-1 px-6 py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBookletCard key={i} variant="doctor" />
        ))}
      </ScrollView>
    </View>
  );
}

export function PatientListSkeleton() {
  return (
    <SkeletonProvider>
      <PatientListSkeletonContent />
    </SkeletonProvider>
  );
}
