import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, Modal, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useThemeStore } from "@/stores";
import { formatDate, calculateDueDate } from "@/utils";

interface EditLMPModalProps {
  visible: boolean;
  onClose: () => void;
  currentLMP?: Date | null;
  onSave: (lmp: Date | null, dueDate: Date | null) => Promise<void>;
  isSaving: boolean;
}

export function EditLMPModal({
  visible,
  onClose,
  currentLMP,
  onSave,
  isSaving,
}: EditLMPModalProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState<Date | null>(
    null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setLastMenstrualPeriod(currentLMP ?? null);
      setShowDatePicker(false);
    }
  }, [visible, currentLMP]);

  // Auto-calculate due date from LMP
  const calculatedDueDate = useMemo(() => {
    if (!lastMenstrualPeriod) return null;
    return calculateDueDate(lastMenstrualPeriod);
  }, [lastMenstrualPeriod]);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setLastMenstrualPeriod(selectedDate);
    }
  };

  const handleSave = async () => {
    await onSave(lastMenstrualPeriod, calculatedDueDate);
  };

  const handleClear = () => {
    setLastMenstrualPeriod(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <Pressable onPress={onClose} disabled={isSaving}>
            <Text className="text-gray-500 dark:text-gray-400">Cancel</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Last Menstrual Period
          </Text>
          <Pressable onPress={handleSave} disabled={isSaving}>
            <Text
              className={`font-semibold ${
                isSaving ? "text-gray-400" : "text-blue-500"
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 py-6">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Set the patient's last menstrual period to calculate Age of
            Gestation (AOG) and expected due date.
          </Text>

          {/* Date Picker Button */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LMP Date
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 flex-row items-center justify-between bg-white dark:bg-gray-800"
              disabled={isSaving}
            >
              <Text
                className={
                  lastMenstrualPeriod
                    ? "text-base text-gray-900 dark:text-white"
                    : "text-base text-gray-400 dark:text-gray-500"
                }
              >
                {lastMenstrualPeriod
                  ? formatDate(lastMenstrualPeriod)
                  : "Select date"}
              </Text>
              <Calendar
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
                strokeWidth={1.5}
              />
            </Pressable>
            {lastMenstrualPeriod && (
              <Pressable onPress={handleClear} className="mt-2">
                <Text className="text-sm text-blue-600 dark:text-blue-400">
                  Clear date
                </Text>
              </Pressable>
            )}
          </View>

          {/* Calculated Due Date Display */}
          {calculatedDueDate && (
            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <Text className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Estimated Due Date
              </Text>
              <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatDate(calculatedDueDate)}
              </Text>
              <Text className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                Calculated from LMP (Naegele's rule: LMP + 280 days)
              </Text>
            </View>
          )}

          {!lastMenstrualPeriod && (
            <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                No LMP set. Select a date to calculate the expected due date.
              </Text>
            </View>
          )}
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <View className="border-t border-gray-200 dark:border-gray-700">
            {Platform.OS === "ios" && (
              <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <View className="flex-row justify-end px-4 py-2">
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <Text className="text-blue-600 dark:text-blue-400 font-medium">
                      Done
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
            <View className="bg-white dark:bg-gray-800">
              <DateTimePicker
                value={lastMenstrualPeriod || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                themeVariant={isDark ? "dark" : "light"}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
