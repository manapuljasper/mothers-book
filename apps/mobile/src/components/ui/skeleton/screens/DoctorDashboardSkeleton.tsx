import React from "react";
import { View, ScrollView } from "react-native";
import { SkeletonProvider } from "../SkeletonContext";
import { SkeletonBox } from "../SkeletonBox";

function DoctorDashboardSkeletonContent() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Stats */}
      <View className="flex-row px-4 pt-4">
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-5 mx-2 border border-gray-100 dark:border-gray-700">
          <SkeletonBox width={40} height={30} borderRadius={4} />
          <View className="mt-1">
            <SkeletonBox width={100} height={16} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View className="px-6 mt-8">
        <SkeletonBox width={180} height={22} borderRadius={4} />
        <View className="mt-4">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-3 border border-gray-100 dark:border-gray-700"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <SkeletonBox width="60%" height={18} borderRadius={4} />
                  <View className="mt-1">
                    <SkeletonBox width="40%" height={14} borderRadius={4} />
                  </View>
                </View>
                <SkeletonBox width={70} height={26} borderRadius={13} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Patients */}
      <View className="px-6 mt-8 mb-8">
        <SkeletonBox width={130} height={22} borderRadius={4} />
        <View className="mt-4">
          {[1, 2].map((i) => (
            <View
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-3 border border-gray-100 dark:border-gray-700"
            >
              <SkeletonBox width="50%" height={18} borderRadius={4} />
              <View className="mt-1">
                <SkeletonBox width="30%" height={14} borderRadius={4} />
              </View>
              <View className="mt-2">
                <SkeletonBox width="40%" height={12} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export function DoctorDashboardSkeleton() {
  return (
    <SkeletonProvider>
      <DoctorDashboardSkeletonContent />
    </SkeletonProvider>
  );
}
