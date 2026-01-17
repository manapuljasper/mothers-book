/**
 * SyncStatusBadge Component
 *
 * Displays current sync status with visual indicators.
 * Tappable to show sync details or failed mutations.
 */

import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import {
  Cloud,
  CloudOff,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react-native';
import {
  useSyncStore,
  selectPendingCount,
  selectFailedCount,
  selectIsOffline,
  selectSyncingCount,
} from '../../stores';

type SyncStatusType = 'synced' | 'syncing' | 'pending' | 'failed' | 'offline';

interface SyncStatusBadgeProps {
  /** Callback when badge is pressed */
  onPress?: () => void;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Show label text */
  showLabel?: boolean;
}

const STATUS_STYLES: Record<
  SyncStatusType,
  {
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
  }
> = {
  synced: {
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-700',
    textColor: 'text-green-700 dark:text-green-400',
    iconColor: '#22c55e', // green-500
  },
  syncing: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-700',
    textColor: 'text-blue-700 dark:text-blue-400',
    iconColor: '#3b82f6', // blue-500
  },
  pending: {
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-700',
    textColor: 'text-amber-700 dark:text-amber-400',
    iconColor: '#f59e0b', // amber-500
  },
  failed: {
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-700',
    textColor: 'text-red-700 dark:text-red-400',
    iconColor: '#ef4444', // red-500
  },
  offline: {
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-600 dark:text-gray-400',
    iconColor: '#6b7280', // gray-500
  },
};

function SpinningIcon({ color }: { color: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1500 }), -1, false);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <RefreshCw size={14} color={color} />
    </Animated.View>
  );
}

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[animatedStyle, { backgroundColor: color }]}
      className="w-2 h-2 rounded-full"
    />
  );
}

export function SyncStatusBadge({
  onPress,
  size = 'medium',
  showLabel = true,
}: SyncStatusBadgeProps) {
  const isOffline = useSyncStore(selectIsOffline);
  const pendingCount = useSyncStore(selectPendingCount);
  const failedCount = useSyncStore(selectFailedCount);
  const syncingCount = useSyncStore(selectSyncingCount);
  const syncStatus = useSyncStore((state) => state.syncStatus);

  // Determine current status
  let status: SyncStatusType;
  let label: string;
  let count: number | null = null;

  if (isOffline) {
    status = 'offline';
    label = 'Offline';
  } else if (failedCount > 0) {
    status = 'failed';
    label = 'Failed';
    count = failedCount;
  } else if (syncStatus === 'syncing' || syncingCount > 0) {
    status = 'syncing';
    label = 'Syncing';
    count = syncingCount;
  } else if (pendingCount > 0) {
    status = 'pending';
    label = 'Pending';
    count = pendingCount;
  } else {
    status = 'synced';
    label = 'Synced';
  }

  const styles = STATUS_STYLES[status];
  const iconSize = size === 'small' ? 12 : 16;
  const paddingClass = size === 'small' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSizeClass = size === 'small' ? 'text-xs' : 'text-sm';

  const renderIcon = () => {
    switch (status) {
      case 'synced':
        return <Check size={iconSize} color={styles.iconColor} />;
      case 'syncing':
        return <SpinningIcon color={styles.iconColor} />;
      case 'pending':
        return <PulsingDot color={styles.iconColor} />;
      case 'failed':
        return <AlertTriangle size={iconSize} color={styles.iconColor} />;
      case 'offline':
        return <CloudOff size={iconSize} color={styles.iconColor} />;
    }
  };

  const content = (
    <View
      className={`flex-row items-center gap-1.5 ${paddingClass} rounded-full border ${styles.bgColor} ${styles.borderColor}`}
    >
      {renderIcon()}
      {showLabel && (
        <Text className={`font-medium ${textSizeClass} ${styles.textColor}`}>
          {label}
          {count !== null && count > 0 && ` (${count})`}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export default SyncStatusBadge;
