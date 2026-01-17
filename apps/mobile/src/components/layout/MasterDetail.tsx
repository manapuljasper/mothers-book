/**
 * Master-Detail Layout Component
 *
 * Provides a split-view layout for tablet where a list (master) is shown
 * alongside detailed content (detail). On phone, only renders the master.
 */

import { View } from "react-native";
import { useResponsive } from "@/hooks";

interface MasterDetailProps {
  /** The list/master view content */
  master: React.ReactNode;
  /** The detail view content (null when nothing selected) */
  detail: React.ReactNode | null;
  /** Content to show when no detail is selected */
  emptyDetail?: React.ReactNode;
  /** Width of the master panel in pixels (default: 380) */
  masterWidth?: number;
}

export function MasterDetail({
  master,
  detail,
  emptyDetail,
  masterWidth = 380,
}: MasterDetailProps) {
  const { isTablet } = useResponsive();

  // On phone, just render master (detail navigation handled separately)
  if (!isTablet) {
    return <>{master}</>;
  }

  // On tablet, render side-by-side
  return (
    <View className="flex-1 flex-row bg-gray-50 dark:bg-gray-900">
      {/* Master panel (list) */}
      <View
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
        style={{ width: masterWidth }}
      >
        {master}
      </View>

      {/* Detail panel */}
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {detail || emptyDetail || null}
      </View>
    </View>
  );
}
