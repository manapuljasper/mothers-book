import React from "react";
import { View, StyleSheet } from "react-native";
import { SkeletonBox } from "./SkeletonBox";

export function SkeletonTabBar() {
  return (
    <View style={styles.container}>
      {/* History Tab (Active) */}
      <View style={[styles.tab, styles.activeTab]}>
        <SkeletonBox
          width={18}
          height={18}
          borderRadius={4}
          style={{ opacity: 0.4 }}
        />
        <SkeletonBox
          width={50}
          height={14}
          borderRadius={4}
          style={{ opacity: 0.5 }}
        />
      </View>

      {/* Meds Tab */}
      <View style={styles.tab}>
        <SkeletonBox width={18} height={18} borderRadius={4} />
        <SkeletonBox width={36} height={14} borderRadius={4} />
      </View>

      {/* Labs Tab */}
      <View style={styles.tab}>
        <SkeletonBox width={18} height={18} borderRadius={4} />
        <SkeletonBox width={30} height={14} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b", // slate-800
    padding: 6,
    borderRadius: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.6)", // slate-700/60
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#3b82f6", // blue-500
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});
