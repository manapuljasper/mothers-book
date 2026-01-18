/**
 * Active Medications Manager
 *
 * Shows currently active medications for a booklet, allowing the doctor to:
 * - Extend the end date
 * - Stop the medication early
 */

import { useState, useMemo } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Pill,
  Calendar,
  CalendarPlus,
  StopCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
} from "lucide-react-native";
import { useActiveMedications, useUpdateMedication, useDeactivateMedication } from "@/hooks";
import { formatDate, formatDaysRemaining } from "@/utils";
import type { MedicationWithLogs } from "@/types";

interface ActiveMedicationsManagerProps {
  bookletId: string;
  /** Default end date for extensions (e.g., follow-up date) */
  defaultExtendDate?: Date | null;
  /** When editing an entry, exclude medications from that entry (they appear in Prescriptions section) */
  editingEntryId?: string;
}

export function ActiveMedicationsManager({
  bookletId,
  defaultExtendDate,
  editingEntryId,
}: ActiveMedicationsManagerProps) {
  const activeMedsRaw = useActiveMedications(bookletId);

  // Filter out medications from the entry being edited (they appear in Prescriptions section)
  const activeMeds = useMemo(() => {
    if (!activeMedsRaw) return undefined;
    if (!editingEntryId) return activeMedsRaw;
    return activeMedsRaw.filter((med: MedicationWithLogs) => med.medicalEntryId !== editingEntryId);
  }, [activeMedsRaw, editingEntryId]);
  const updateMedication = useUpdateMedication();
  const deactivateMedication = useDeactivateMedication();

  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, { newEndDate?: Date; stopped?: boolean }>>({});

  if (activeMeds === undefined) {
    return (
      <View className="py-4">
        <Text className="text-gray-400 text-sm text-center">Loading active medications...</Text>
      </View>
    );
  }

  if (activeMeds.length === 0) {
    return null; // Don't show section if no active medications
  }

  const toggleExpand = (id: string) => {
    setExpandedMedId(expandedMedId === id ? null : id);
  };

  const handleExtendDate = (medId: string, newDate: Date) => {
    setPendingChanges((prev) => ({
      ...prev,
      [medId]: { ...prev[medId], newEndDate: newDate, stopped: false },
    }));
  };

  const handleStopMedication = (medId: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [medId]: { ...prev[medId], stopped: true, newEndDate: undefined },
    }));
  };

  const handleUndoChange = (medId: string) => {
    setPendingChanges((prev) => {
      const updated = { ...prev };
      delete updated[medId];
      return updated;
    });
  };

  const handleDateChange = (medId: string) => (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(null);
    }
    if (selectedDate) {
      handleExtendDate(medId, selectedDate);
    }
  };

  const getChangeForMed = (medId: string) => pendingChanges[medId];

  // Apply changes when the entry is saved - expose this via ref or callback
  // For now, we'll apply immediately when tapping confirm
  const applyChange = async (med: MedicationWithLogs) => {
    const change = pendingChanges[med.id];
    if (!change) return;

    try {
      if (change.stopped) {
        // Stop the medication by setting endDate to today and deactivating
        await deactivateMedication(med.id);
      } else if (change.newEndDate) {
        // Extend the end date
        await updateMedication({
          id: med.id,
          updates: { endDate: change.newEndDate },
        });
      }

      // Clear the pending change after successful update
      handleUndoChange(med.id);
    } catch (error) {
      console.error("Failed to update medication:", error);
    }
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-3">
        <Clock size={16} color="#f59e0b" strokeWidth={1.5} />
        <Text className="text-amber-600 dark:text-amber-400 font-semibold ml-2 text-sm">
          Active Medications ({activeMeds.length})
        </Text>
      </View>

      <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3">
        <Text className="text-amber-700 dark:text-amber-300 text-xs mb-3">
          Review ongoing medications. Extend or stop as needed.
        </Text>

        {activeMeds.map((med: MedicationWithLogs) => {
          const change = getChangeForMed(med.id);
          const isExpanded = expandedMedId === med.id;
          const daysRemaining = med.endDate
            ? Math.ceil((med.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <View
              key={med.id}
              className={`bg-white dark:bg-gray-800 border rounded-lg mb-2 overflow-hidden ${
                change?.stopped
                  ? "border-red-300 dark:border-red-700"
                  : change?.newEndDate
                  ? "border-green-300 dark:border-green-700"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Header */}
              <Pressable
                onPress={() => toggleExpand(med.id)}
                className="flex-row items-center justify-between p-3"
              >
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className={`font-medium ${change?.stopped ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}>
                      {med.name}
                    </Text>
                    {change?.stopped && (
                      <View className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded ml-2">
                        <Text className="text-red-600 dark:text-red-400 text-xs font-medium">Stopping</Text>
                      </View>
                    )}
                    {change?.newEndDate && !change?.stopped && (
                      <View className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded ml-2">
                        <Text className="text-green-600 dark:text-green-400 text-xs font-medium">Extended</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {med.dosage} • {med.frequencyPerDay}x daily
                  </Text>
                  {/* End date info */}
                  {med.endDate && !change?.stopped && (
                    <Text className={`text-xs mt-1 ${
                      daysRemaining !== null && daysRemaining <= 2
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-gray-400"
                    }`}>
                      {change?.newEndDate
                        ? `Extended to ${formatDate(change.newEndDate)}`
                        : `Ends ${formatDate(med.endDate)} (${formatDaysRemaining(daysRemaining)})`
                      }
                    </Text>
                  )}
                  {!med.endDate && !change?.stopped && (
                    <Text className="text-gray-400 text-xs mt-1">No end date set</Text>
                  )}
                </View>
                {isExpanded ? (
                  <ChevronUp size={18} color="#6b7280" strokeWidth={1.5} />
                ) : (
                  <ChevronDown size={18} color="#6b7280" strokeWidth={1.5} />
                )}
              </Pressable>

              {/* Expanded actions */}
              {isExpanded && (
                <View className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                  {change ? (
                    // Show pending change with undo/confirm
                    <View className="mt-3">
                      <Text className="text-gray-500 text-sm mb-2">
                        {change.stopped
                          ? "This medication will be stopped when you save."
                          : `End date will be extended to ${formatDate(change.newEndDate!)}.`
                        }
                      </Text>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleUndoChange(med.id)}
                          className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <Text className="text-gray-600 dark:text-gray-300 text-center text-sm font-medium">
                            Undo
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => applyChange(med)}
                          className={`flex-1 py-2 rounded-lg flex-row items-center justify-center ${
                            change.stopped ? "bg-red-500" : "bg-green-500"
                          }`}
                        >
                          <Check size={14} color="white" strokeWidth={2} />
                          <Text className="text-white text-center text-sm font-medium ml-1">
                            Apply Now
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    // Show extend/stop buttons
                    <View className="flex-row gap-2 mt-3">
                      <Pressable
                        onPress={() => setShowDatePicker(med.id)}
                        className="flex-1 flex-row items-center justify-center py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg"
                      >
                        <CalendarPlus size={16} color="#22c55e" strokeWidth={1.5} />
                        <Text className="text-green-600 dark:text-green-400 text-sm font-medium ml-1.5">
                          Extend
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleStopMedication(med.id)}
                        className="flex-1 flex-row items-center justify-center py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg"
                      >
                        <StopCircle size={16} color="#ef4444" strokeWidth={1.5} />
                        <Text className="text-red-600 dark:text-red-400 text-sm font-medium ml-1.5">
                          Stop
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {/* Date picker */}
                  {showDatePicker === med.id && (
                    <View className="mt-3">
                      <DateTimePicker
                        value={defaultExtendDate || med.endDate || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        minimumDate={new Date()}
                        onChange={handleDateChange(med.id)}
                      />
                      {Platform.OS === "ios" && (
                        <View className="flex-row justify-end mt-2">
                          <Pressable
                            onPress={() => setShowDatePicker(null)}
                            className="bg-green-500 px-4 py-2 rounded-lg"
                          >
                            <Text className="text-white font-medium">Done</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
