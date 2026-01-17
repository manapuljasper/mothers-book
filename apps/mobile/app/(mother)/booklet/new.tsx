import { useState, useMemo } from "react";
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
import { formatDate, calculateDueDate } from "@/utils";

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
  const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState<Date | null>(null);
  const [showLMPPicker, setShowLMPPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate due date from LMP
  const calculatedDueDate = useMemo(() => {
    if (!lastMenstrualPeriod) return null;
    return calculateDueDate(lastMenstrualPeriod);
  }, [lastMenstrualPeriod]);

  const handleLMPChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowLMPPicker(false);
    }
    if (selectedDate) {
      setLastMenstrualPeriod(selectedDate);
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
        lastMenstrualPeriod: lastMenstrualPeriod?.getTime(),
        expectedDueDate: calculatedDueDate?.getTime(),
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

        {/* Last Menstrual Period Field */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Menstrual Period (LMP)
          </Text>
          <Pressable
            onPress={() => setShowLMPPicker(true)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 flex-row items-center justify-between bg-white dark:bg-gray-800"
            disabled={isSubmitting}
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
                : "Select date (optional)"}
            </Text>
            <Calendar
              size={20}
              color={isDark ? "#9ca3af" : "#6b7280"}
              strokeWidth={1.5}
            />
          </Pressable>
          {lastMenstrualPeriod && (
            <Pressable
              onPress={() => setLastMenstrualPeriod(null)}
              className="mt-2"
            >
              <Text className="text-sm text-pink-600 dark:text-pink-400">
                Clear date
              </Text>
            </Pressable>
          )}
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Used to calculate your Age of Gestation (AOG)
          </Text>
        </View>

        {/* Auto-calculated Due Date Display */}
        {calculatedDueDate && (
          <View className="mb-6 bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-100 dark:border-pink-800">
            <Text className="text-sm font-medium text-pink-700 dark:text-pink-300 mb-1">
              Estimated Due Date
            </Text>
            <Text className="text-lg font-bold text-pink-600 dark:text-pink-400">
              {formatDate(calculatedDueDate)}
            </Text>
            <Text className="text-xs text-pink-500 dark:text-pink-400 mt-1">
              Calculated from LMP (Naegele's rule)
            </Text>
          </View>
        )}

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

      {/* LMP Date Picker Modal */}
      {showLMPPicker && (
        <View>
          {Platform.OS === "ios" && (
            <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row justify-end px-4 py-2">
                <Pressable onPress={() => setShowLMPPicker(false)}>
                  <Text className="text-pink-600 dark:text-pink-400 font-medium">
                    Done
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          <DateTimePicker
            value={lastMenstrualPeriod || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleLMPChange}
            maximumDate={new Date()} // LMP can't be in the future
            themeVariant={isDark ? "dark" : "light"}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
