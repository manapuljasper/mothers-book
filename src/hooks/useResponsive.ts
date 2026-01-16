/**
 * Responsive Layout Hook
 *
 * Provides device type detection and responsive utilities for iPad support.
 * Uses React Native's useWindowDimensions for real-time dimension tracking.
 */

import { useWindowDimensions } from "react-native";

export type DeviceType = "phone" | "tablet";

// iPad Mini portrait width is 768pt - use as tablet breakpoint
const TABLET_MIN_WIDTH = 768;

export interface ResponsiveValues {
  /** Current viewport width */
  width: number;
  /** Current viewport height */
  height: number;
  /** True if device is tablet-sized (>= 768pt width) */
  isTablet: boolean;
  /** True if device is phone-sized (< 768pt width) */
  isPhone: boolean;
  /** Device type: 'phone' or 'tablet' */
  deviceType: DeviceType;
  /** Helper to select values based on device type */
  select: <T>(options: { phone: T; tablet: T }) => T;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= TABLET_MIN_WIDTH;
  const isPhone = !isTablet;
  const deviceType: DeviceType = isTablet ? "tablet" : "phone";

  const select = <T>(options: { phone: T; tablet: T }): T => {
    return isTablet ? options.tablet : options.phone;
  };

  return {
    width,
    height,
    isTablet,
    isPhone,
    deviceType,
    select,
  };
}
