import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonProvider } from "../SkeletonContext";
import { SkeletonBox } from "../SkeletonBox";
import { SkeletonStatCard } from "../SkeletonStatCard";
import { SkeletonMedicationCard } from "../SkeletonMedicationCard";
import { SkeletonEntryCard } from "../SkeletonEntryCard";

function MotherBookletDetailSkeletonContent() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-pink-500" edges={[]}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header skeleton */}
        <View className="bg-pink-500 px-6 py-6" style={{ paddingTop: insets.top }}>
          {/* Back button placeholder */}
          <View className="flex-row items-center mb-3">
            <SkeletonBox
              width={70}
              height={20}
              borderRadius={4}
              style={{ opacity: 0.5 }}
            />
          </View>
          {/* Booklet label */}
          <SkeletonBox
            width="60%"
            height={28}
            borderRadius={4}
            style={{ opacity: 0.7 }}
          />
          {/* Status badge + due date */}
          <View className="flex-row items-center mt-2">
            <SkeletonBox
              width={60}
              height={24}
              borderRadius={12}
              style={{ opacity: 0.5 }}
            />
            <View className="ml-3">
              <SkeletonBox
                width={100}
                height={16}
                borderRadius={4}
                style={{ opacity: 0.5 }}
              />
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row px-4 -mt-4">
          <SkeletonStatCard size="sm" />
          <SkeletonStatCard size="sm" />
          <SkeletonStatCard size="sm" />
        </View>

        {/* My Doctors section */}
        <View className="px-6 mt-8">
          <SkeletonBox width={100} height={22} borderRadius={4} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 mr-3 border border-gray-100 dark:border-gray-700"
                style={{ minWidth: 140 }}
              >
                <SkeletonBox width={100} height={16} borderRadius={4} />
                <View className="mt-1">
                  <SkeletonBox width={60} height={12} borderRadius={4} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Pending Labs section */}
        <View className="px-6 mt-6">
          <SkeletonBox width={120} height={20} borderRadius={4} />
        </View>

        {/* Active Medications section */}
        <View className="px-6 mt-4">
          <SkeletonBox width={150} height={20} borderRadius={4} />
        </View>

        {/* Visit History section */}
        <View className="px-6 mt-8 mb-8">
          <SkeletonBox width={100} height={22} borderRadius={4} />
          {/* Date selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3 mb-4"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} className="mr-2">
                <SkeletonBox width={56} height={64} borderRadius={12} />
              </View>
            ))}
          </ScrollView>
          {/* Entry card */}
          <SkeletonEntryCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function MotherBookletDetailSkeleton() {
  return (
    <SkeletonProvider>
      <MotherBookletDetailSkeletonContent />
    </SkeletonProvider>
  );
}
