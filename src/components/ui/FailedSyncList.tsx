/**
 * FailedSyncList Component
 *
 * Displays failed mutations with options to retry or discard.
 * Shows error messages and allows users to manage sync failures.
 */

import { View, Text, ScrollView, Alert } from 'react-native';
import { AlertTriangle, RefreshCw, Trash2, Clock } from 'lucide-react-native';
import {
  useSyncStore,
  selectFailedMutations,
  PendingMutation,
  SyncableTable,
  MutationOperation,
} from '../../stores';
import { Button } from './Button';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface FailedSyncListProps {
  /** Callback when an item is retried */
  onRetry?: (id: string) => void;
  /** Callback when an item is discarded */
  onDiscard?: (id: string) => void;
  /** Maximum height for the scrollable list */
  maxHeight?: number;
}

// Human-readable table names
const TABLE_LABELS: Record<SyncableTable, string> = {
  booklets: 'Booklet',
  bookletAccess: 'Doctor Access',
  medicalEntries: 'Medical Entry',
  labRequests: 'Lab Request',
  medications: 'Medication',
  medicationIntakeLogs: 'Intake Log',
};

// Human-readable operation names
const OPERATION_LABELS: Record<MutationOperation, string> = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
};

function getOperationDescription(mutation: PendingMutation): string {
  const table = TABLE_LABELS[mutation.tableName] || mutation.tableName;
  const operation = OPERATION_LABELS[mutation.operation] || mutation.operation;
  return `${operation} ${table}`;
}

function FailedMutationItem({
  mutation,
  onRetry,
  onDiscard,
}: {
  mutation: PendingMutation;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  const handleDiscard = () => {
    Alert.alert(
      'Discard Change',
      'Are you sure you want to discard this change? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onDiscard },
      ]
    );
  };

  const timeAgo = mutation.lastAttempt
    ? dayjs(mutation.lastAttempt).fromNow()
    : dayjs(mutation.timestamp).fromNow();

  return (
    <View className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50 mb-3">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle size={16} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {getOperationDescription(mutation)}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Clock size={12} color="#9ca3af" />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo} • {mutation.retryCount} retries
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Error message */}
      {mutation.lastError && (
        <View className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-3">
          <Text className="text-sm text-red-700 dark:text-red-400">
            {mutation.lastError}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onPress={onRetry}
            fullWidth
          >
            Retry
          </Button>
        </View>
        <View className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onPress={handleDiscard}
            fullWidth
          >
            Discard
          </Button>
        </View>
      </View>
    </View>
  );
}

export function FailedSyncList({
  onRetry,
  onDiscard,
  maxHeight = 400,
}: FailedSyncListProps) {
  const failedMutations = useSyncStore(selectFailedMutations);
  const retryMutation = useSyncStore((state) => state.retryMutation);
  const discardMutation = useSyncStore((state) => state.discardMutation);

  const handleRetry = (id: string) => {
    retryMutation(id);
    onRetry?.(id);
  };

  const handleDiscard = (id: string) => {
    discardMutation(id);
    onDiscard?.(id);
  };

  const handleRetryAll = () => {
    failedMutations.forEach((mutation) => {
      retryMutation(mutation.id);
    });
  };

  const handleDiscardAll = () => {
    Alert.alert(
      'Discard All Failed Changes',
      `Are you sure you want to discard all ${failedMutations.length} failed changes? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard All',
          style: 'destructive',
          onPress: () => {
            failedMutations.forEach((mutation) => {
              discardMutation(mutation.id);
            });
          },
        },
      ]
    );
  };

  if (failedMutations.length === 0) {
    return (
      <View className="items-center justify-center py-8">
        <View className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
          <RefreshCw size={24} color="#22c55e" />
        </View>
        <Text className="text-base font-medium text-gray-900 dark:text-white mb-1">
          All Synced
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
          No failed changes to display
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Failed Changes ({failedMutations.length})
        </Text>
      </View>

      {/* Bulk actions */}
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onPress={handleRetryAll}
            fullWidth
          >
            Retry All
          </Button>
        </View>
        <View className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onPress={handleDiscardAll}
            fullWidth
          >
            Discard All
          </Button>
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={{ maxHeight }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {failedMutations.map((mutation) => (
          <FailedMutationItem
            key={mutation.id}
            mutation={mutation}
            onRetry={() => handleRetry(mutation.id)}
            onDiscard={() => handleDiscard(mutation.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default FailedSyncList;
