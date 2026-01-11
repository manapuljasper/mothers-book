import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { X, Calendar } from "lucide-react-native";
import { useThemeStore } from "@/stores";
import { useCurrentUser, useCreateBooklet } from "@/hooks";
import { ButtonPressable } from "@/components/ui";
import { formatDate } from "@/utils";

export default function NewBookletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const currentUser = useCurrentUser();
  const motherProfile = currentUser?.motherProfile;
  const createBooklet = useCreateBooklet();

  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedDueDate, setExpectedDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpectedDueDate(selectedDate);
    }
  };

  const handleCreate = async () => {
    if (!label.trim()) {
      Alert.alert("Required", "Please enter a label for the booklet");
      return;
    }

    if (!motherProfile) {
      Alert.alert("Error", "No mother profile found");
      return;
    }

    setIsSubmitting(true);

    try {
      const newBooklet = await createBooklet({
        motherId: motherProfile._id,
        label: label.trim(),
        status: "active",
        expectedDueDate: expectedDueDate?.getTime(),
        notes: notes.trim() || undefined,
      });

      if (newBooklet) {
        router.replace(`/booklet/${newBooklet.id}`);
      }
    } catch (_error) {
      Alert.alert("Error", "Failed to create booklet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-gray-900"
      edges={["bottom"]}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <X size={24} color={isDark ? "#fff" : "#374151"} strokeWidth={1.5} />
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          New Booklet
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
      >
        {/* Label Field */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Booklet Label *
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            placeholder="e.g., Baby #1, My First Pregnancy"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={label}
            onChangeText={setLabel}
            autoFocus
            editable={!isSubmitting}
          />
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            This helps you identify each pregnancy record
          </Text>
        </View>

        {/* Expected Due Date Field */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expected Due Date
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 flex-row items-center justify-between bg-white dark:bg-gray-800"
            disabled={isSubmitting}
          >
            <Text
              className={
                expectedDueDate
                  ? "text-base text-gray-900 dark:text-white"
                  : "text-base text-gray-400 dark:text-gray-500"
              }
            >
              {expectedDueDate
                ? formatDate(expectedDueDate)
                : "Select date (optional)"}
            </Text>
            <Calendar
              size={20}
              color={isDark ? "#9ca3af" : "#6b7280"}
              strokeWidth={1.5}
            />
          </Pressable>
          {expectedDueDate && (
            <Pressable
              onPress={() => setExpectedDueDate(null)}
              className="mt-2"
            >
              <Text className="text-sm text-pink-600 dark:text-pink-400">
                Clear date
              </Text>
            </Pressable>
          )}
        </View>

        {/* Notes Field */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            placeholder="Any additional notes (optional)"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
            editable={!isSubmitting}
          />
        </View>

        {/* Create Button */}
        <ButtonPressable
          className="bg-pink-600 rounded-lg py-4"
          onPress={handleCreate}
          disabled={isSubmitting}
        >
          <Text className="text-white text-center font-semibold text-base">
            {isSubmitting ? "Creating..." : "Create Booklet"}
          </Text>
        </ButtonPressable>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View>
          {Platform.OS === "ios" && (
            <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row justify-end px-4 py-2">
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text className="text-pink-600 dark:text-pink-400 font-medium">
                    Done
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          <DateTimePicker
            value={expectedDueDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            minimumDate={new Date()}
            themeVariant={isDark ? "dark" : "light"}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
