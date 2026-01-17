import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { SkeletonProvider } from "../SkeletonContext";
import { SkeletonBox } from "../SkeletonBox";
import { SkeletonTabBar } from "../SkeletonTabBar";
import { SkeletonTimelineDateBadge } from "../SkeletonTimelineDateBadge";
import { SkeletonTimelineEntryCard } from "../SkeletonTimelineEntryCard";

function DoctorBookletDetailSkeletonContent() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-slate-900"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View
          className="bg-blue-500 px-5 pb-12 relative overflow-hidden"
          style={{
            paddingTop: insets.top + 8,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          {/* Background decoration */}
          <View
            className="absolute -top-32 -right-16 w-64 h-64 bg-white/5 rounded-full"
            style={{ transform: [{ scale: 1.5 }] }}
          />

          {/* Back button */}
          <View className="flex-row items-center mb-6 opacity-90">
            <SkeletonBox
              width={60}
              height={20}
              borderRadius={4}
              style={{ opacity: 0.5 }}
            />
          </View>

          {/* Name and AOG badge row */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              {/* Patient name */}
              <SkeletonBox
                width="70%"
                height={32}
                borderRadius={4}
                style={{ opacity: 0.7 }}
              />
              {/* Baby icon + label */}
              <View className="flex-row items-center gap-2 mt-2">
                <SkeletonBox
                  width={14}
                  height={14}
                  borderRadius={7}
                  style={{ opacity: 0.5 }}
                />
                <SkeletonBox
                  width={80}
                  height={16}
                  borderRadius={4}
                  style={{ opacity: 0.5 }}
                />
              </View>
            </View>
            {/* AOG Badge placeholder */}
            <View
              className="bg-white/20 items-center justify-center border border-white/10"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
              }}
            >
              <SkeletonBox
                width={28}
                height={16}
                borderRadius={4}
                style={{ opacity: 0.5 }}
              />
            </View>
          </View>

          {/* Status badge + due date */}
          <View className="flex-row items-center gap-3 mt-5">
            <SkeletonBox
              width={70}
              height={26}
              borderRadius={13}
              style={{ opacity: 0.5 }}
            />
            <SkeletonBox
              width={110}
              height={26}
              borderRadius={13}
              style={{ opacity: 0.4 }}
            />
          </View>
        </View>

        {/* Content */}
        <View className="px-5 -mt-8 relative z-20 pb-24">
          {/* Tab Bar */}
          <View className="mb-6">
            <SkeletonTabBar />
          </View>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            {/* Vertical Timeline Line */}
            <View style={styles.timelineLine} />

            {/* First Entry (expanded) */}
            <View style={styles.entryRow}>
              <View style={styles.entryContent}>
                <View style={styles.dateBadgeContainer}>
                  <SkeletonTimelineDateBadge isActive />
                </View>
                <SkeletonTimelineEntryCard variant="expanded" />
              </View>
            </View>

            {/* Second Entry (compact) */}
            <View style={styles.entryRow}>
              <View style={styles.entryContent}>
                <View style={styles.dateBadgeContainer}>
                  <SkeletonTimelineDateBadge />
                </View>
                <SkeletonTimelineEntryCard variant="compact" />
              </View>
            </View>

            {/* Third Entry (compact) */}
            <View style={styles.entryRow}>
              <View style={styles.entryContent}>
                <View style={styles.dateBadgeContainer}>
                  <SkeletonTimelineDateBadge />
                </View>
                <SkeletonTimelineEntryCard variant="compact" />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function DoctorBookletDetailSkeleton() {
  return (
    <SkeletonProvider>
      <DoctorBookletDetailSkeletonContent />
    </SkeletonProvider>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 27,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    zIndex: 0,
  },
  entryRow: {
    position: "relative",
    paddingBottom: 32,
    zIndex: 10,
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  dateBadgeContainer: {
    minWidth: 56,
  },
});
