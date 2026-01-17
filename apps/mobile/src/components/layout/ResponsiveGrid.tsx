/**
 * Responsive Grid Component
 *
 * Renders children in a responsive grid layout.
 * Adjusts number of columns based on device type.
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { useResponsive } from "@/hooks";

interface ResponsiveGridProps {
  children: React.ReactNode;
  /** Number of columns per device type */
  columns?: { phone: number; tablet: number };
  /** Gap between items in pixels */
  gap?: number;
}

export function ResponsiveGrid({
  children,
  columns = { phone: 1, tablet: 2 },
  gap = 12,
}: ResponsiveGridProps) {
  const { isTablet } = useResponsive();
  const numColumns = isTablet ? columns.tablet : columns.phone;
  const childArray = React.Children.toArray(children);

  return (
    <View style={[styles.container, { margin: -gap / 2 }]}>
      {childArray.map((child, index) => (
        <View
          key={index}
          style={{
            width: `${100 / numColumns}%`,
            padding: gap / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
