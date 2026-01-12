import { useState } from "react";
import { View, Text, Pressable, Modal, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Plus, X, Clock, ChevronDown } from "lucide-react-native";
import { useThemeStore } from "../../stores";

export interface ScheduleItem {
  days: string;
  startTime: string;
  endTime: string;
}

interface ScheduleEditorProps {
  value: ScheduleItem[];
  onChange: (schedule: ScheduleItem[]) => void;
}

const PRESET_DAYS = [
  { value: "Mon - Fri", label: "Mon - Fri" },
  { value: "Weekends", label: "Weekends" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

// Helper to parse time string to Date
function parseTimeString(timeStr: string): Date {
  const date = new Date();
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    date.setHours(hours, minutes, 0, 0);
  } else {
    date.setHours(9, 0, 0, 0); // Default 9:00 AM
  }
  return date;
}

// Helper to format Date to time string
function formatTimeString(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
}

interface ScheduleRowProps {
  item: ScheduleItem;
  index: number;
  onUpdate: (index: number, item: ScheduleItem) => void;
  onRemove: (index: number) => void;
}

function ScheduleRow({ item, index, onUpdate, onRemove }: ScheduleRowProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleDaysChange = (days: string) => {
    onUpdate(index, { ...item, days });
    setShowDaysPicker(false);
  };

  const handleStartTimeChange = (event: unknown, date?: Date) => {
    if (Platform.OS === "android") {
      setShowStartTimePicker(false);
    }
    if (date) {
      onUpdate(index, { ...item, startTime: formatTimeString(date) });
    }
  };

  const handleEndTimeChange = (event: unknown, date?: Date) => {
    if (Platform.OS === "android") {
      setShowEndTimePicker(false);
    }
    if (date) {
      onUpdate(index, { ...item, endTime: formatTimeString(date) });
    }
  };

  return (
    <View className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-slate-700">
      {/* Days Selector */}
      <Pressable
        onPress={() => setShowDaysPicker(true)}
        className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700"
      >
        <Text className="text-sm text-gray-500 dark:text-gray-400">Days</Text>
        <View className="flex-row items-center">
          <Text className="text-sm font-medium text-gray-900 dark:text-white mr-2">
            {item.days || "Select days"}
          </Text>
          <ChevronDown size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
        </View>
      </Pressable>

      {/* Time Selectors */}
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-row items-center">
          <Clock size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            Hours
          </Text>
        </View>

        <View className="flex-row items-center">
          <Pressable
            onPress={() => setShowStartTimePicker(true)}
            className="bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-sm font-medium text-gray-900 dark:text-white">
              {item.startTime || "09:00 AM"}
            </Text>
          </Pressable>

          <Text className="text-gray-400 mx-2">-</Text>

          <Pressable
            onPress={() => setShowEndTimePicker(true)}
            className="bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-sm font-medium text-gray-900 dark:text-white">
              {item.endTime || "05:00 PM"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Remove Button */}
      <Pressable
        onPress={() => onRemove(index)}
        className="absolute top-2 right-2 p-1"
      >
        <X size={18} color="#ef4444" />
      </Pressable>

      {/* Days Picker Modal */}
      <Modal
        visible={showDaysPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDaysPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setShowDaysPicker(false)}
        >
          <View className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-100 dark:border-slate-700">
              Select Days
            </Text>
            {PRESET_DAYS.map((preset) => (
              <Pressable
                key={preset.value}
                onPress={() => handleDaysChange(preset.value)}
                className={`p-4 border-b border-gray-100 dark:border-slate-700 ${
                  item.days === preset.value
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
              >
                <Text
                  className={`text-base ${
                    item.days === preset.value
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {preset.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowDaysPicker(false)}
              className="p-4"
            >
              <Text className="text-center text-gray-500 dark:text-gray-400">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Start Time Picker */}
      {showStartTimePicker && (
        <Modal
          visible={showStartTimePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStartTimePicker(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setShowStartTimePicker(false)}
          >
            <View className="bg-white dark:bg-slate-800 rounded-t-2xl">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700">
                <Pressable onPress={() => setShowStartTimePicker(false)}>
                  <Text className="text-gray-500 dark:text-gray-400">
                    Cancel
                  </Text>
                </Pressable>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  Start Time
                </Text>
                <Pressable onPress={() => setShowStartTimePicker(false)}>
                  <Text className="text-blue-600 dark:text-blue-400 font-medium">
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={parseTimeString(item.startTime)}
                mode="time"
                display="spinner"
                onChange={handleStartTimeChange}
                style={{ height: 200 }}
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* End Time Picker */}
      {showEndTimePicker && (
        <Modal
          visible={showEndTimePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEndTimePicker(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setShowEndTimePicker(false)}
          >
            <View className="bg-white dark:bg-slate-800 rounded-t-2xl">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700">
                <Pressable onPress={() => setShowEndTimePicker(false)}>
                  <Text className="text-gray-500 dark:text-gray-400">
                    Cancel
                  </Text>
                </Pressable>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  End Time
                </Text>
                <Pressable onPress={() => setShowEndTimePicker(false)}>
                  <Text className="text-blue-600 dark:text-blue-400 font-medium">
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={parseTimeString(item.endTime)}
                mode="time"
                display="spinner"
                onChange={handleEndTimeChange}
                style={{ height: 200 }}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  const handleAddSchedule = () => {
    onChange([
      ...value,
      { days: "Mon - Fri", startTime: "09:00 AM", endTime: "05:00 PM" },
    ]);
  };

  const handleUpdateSchedule = (index: number, item: ScheduleItem) => {
    const newSchedule = [...value];
    newSchedule[index] = item;
    onChange(newSchedule);
  };

  const handleRemoveSchedule = (index: number) => {
    const newSchedule = value.filter((_, i) => i !== index);
    onChange(newSchedule);
  };

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Weekly Schedule
      </Text>

      {value.map((item, index) => (
        <ScheduleRow
          key={index}
          item={item}
          index={index}
          onUpdate={handleUpdateSchedule}
          onRemove={handleRemoveSchedule}
        />
      ))}

      <Pressable
        onPress={handleAddSchedule}
        className="flex-row items-center justify-center py-3 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl"
      >
        <Plus size={18} color={isDark ? "#60a5fa" : "#3b82f6"} />
        <Text className="text-blue-600 dark:text-blue-400 font-medium ml-2">
          Add Schedule
        </Text>
      </Pressable>
    </View>
  );
}
