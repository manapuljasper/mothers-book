/**
 * OfflineBanner Component
 *
 * A banner that appears when the app is offline.
 * Shows pending changes count and sync status.
 */

import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react-native';
import {
  useSyncStore,
  selectIsOffline,
  selectPendingCount,
  selectFailedCount,
} from '../../stores';

interface OfflineBannerProps {
  /** Callback when banner is pressed */
  onPress?: () => void;
}

export function OfflineBanner({ onPress }: OfflineBannerProps) {
  const isOffline = useSyncStore(selectIsOffline);
  const pendingCount = useSyncStore(selectPendingCount);
  const failedCount = useSyncStore(selectFailedCount);

  const translateY = useSharedValue(-100);

  // Animate in/out based on offline status
  useEffect(() => {
    translateY.value = withTiming(isOffline ? 0 : -100, { duration: 300 });
  }, [isOffline, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Don't render if online (but keep for animation)
  if (!isOffline && translateY.value <= -100) {
    return null;
  }

  const totalChanges = pendingCount + failedCount;
  const message =
    totalChanges > 0
      ? `${totalChanges} change${totalChanges !== 1 ? 's' : ''} waiting to sync`
      : 'Changes will sync when connected';

  const content = (
    <View className="flex-row items-center justify-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-900">
      <CloudOff size={16} color="#fbbf24" />
      <Text className="text-sm font-medium text-amber-400">
        You're offline
      </Text>
      <Text className="text-sm text-gray-300">•</Text>
      <Text className="text-sm text-gray-300">{message}</Text>
    </View>
  );

  return (
    <Animated.View
      style={[animatedStyle, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }]}
    >
      {onPress ? (
        <Pressable onPress={onPress}>{content}</Pressable>
      ) : (
        content
      )}
    </Animated.View>
  );
}

/**
 * Compact offline indicator for use in headers/tab bars.
 */
export function OfflineIndicator() {
  const isOffline = useSyncStore(selectIsOffline);
  const pendingCount = useSyncStore(selectPendingCount);

  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isOffline) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      pulseOpacity.value = withTiming(1);
    }
  }, [isOffline, pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={animatedStyle}
      className="flex-row items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full"
    >
      <CloudOff size={12} color="#f59e0b" />
      {pendingCount > 0 && (
        <Text className="text-xs font-medium text-amber-700 dark:text-amber-400">
          {pendingCount}
        </Text>
      )}
    </Animated.View>
  );
}

export default OfflineBanner;
