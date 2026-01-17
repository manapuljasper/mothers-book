import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, X } from "lucide-react-native";
import type { Medication, MedicationFrequency } from "@/types";
import { formatDate } from "@/utils";
import { ModalHeader } from "@/components/ui";

const DOSAGE_UNITS = ["mg", "mcg", "g", "mL", "IU", "tablet", "capsule"] as const;
type DosageUnit = (typeof DOSAGE_UNITS)[number];

interface EditMedicationModalProps {
  visible: boolean;
  medication: Medication | null;
  onClose: () => void;
  onSave: (updates: Partial<Medication>) => Promise<void>;
  isSaving: boolean;
}

export function EditMedicationModal({
  visible,
  medication,
  onClose,
  onSave,
  isSaving,
}: EditMedicationModalProps) {
  // Form state
  const [name, setName] = useState("");
  const [dosageAmount, setDosageAmount] = useState("");
  const [dosageUnit, setDosageUnit] = useState<DosageUnit>("mg");
  const [instructions, setInstructions] = useState("");
  const [frequencyPerDay, setFrequencyPerDay] = useState<MedicationFrequency>(1);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Reset form when medication changes
  useEffect(() => {
    if (medication) {
      setName(medication.name);
      // Parse dosage into amount and unit
      const dosageParts = medication.dosage.match(/^([\d.]+)\s*(.+)$/);
      if (dosageParts) {
        setDosageAmount(dosageParts[1]);
        const unit = dosageParts[2] as DosageUnit;
        if (DOSAGE_UNITS.includes(unit)) {
          setDosageUnit(unit);
        }
      } else {
        setDosageAmount(medication.dosage);
      }
      setInstructions(medication.instructions || "");
      setFrequencyPerDay(medication.frequencyPerDay);
      setEndDate(medication.endDate);
    }
  }, [medication]);

  const handleSave = async () => {
    if (!name.trim() || !dosageAmount.trim()) {
      return;
    }

    await onSave({
      name: name.trim(),
      dosage: `${dosageAmount} ${dosageUnit}`,
      instructions: instructions.trim() || undefined,
      frequencyPerDay,
      endDate,
    });
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  if (!medication) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <ModalHeader
          title="Edit Medication"
          subtitle={`Prescribed: ${formatDate(medication.startDate)}`}
          onClose={onClose}
        />

        <ScrollView className="flex-1 px-6 py-4">
          {/* Medication Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medication Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Ferrous Sulfate"
              placeholderTextColor="#9ca3af"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            />
          </View>

          {/* Dosage */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dosage *
            </Text>
            <TextInput
              value={dosageAmount}
              onChangeText={setDosageAmount}
              placeholder="e.g., 325"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white mb-2"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-2"
            >
              {DOSAGE_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => setDosageUnit(unit)}
                  className={`px-4 py-2 rounded-lg mr-2 ${
                    dosageUnit === unit
                      ? "bg-blue-500"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      dosageUnit === unit
                        ? "text-white font-medium"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Frequency */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency (times per day)
            </Text>
            <View className="flex-row">
              {([1, 2, 3, 4] as MedicationFrequency[]).map((freq) => (
                <Pressable
                  key={freq}
                  onPress={() => setFrequencyPerDay(freq)}
                  className={`flex-1 py-3 mr-2 last:mr-0 rounded-xl border ${
                    frequencyPerDay === freq
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      frequencyPerDay === freq
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {freq}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instructions
            </Text>
            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g., Take after meals"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white min-h-[80px]"
            />
          </View>

          {/* End Date */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date (optional)
            </Text>
            <Pressable
              onPress={() => setShowEndDatePicker(true)}
              className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3"
            >
              <Calendar size={18} color="#6b7280" strokeWidth={1.5} />
              <Text className="text-gray-900 dark:text-white ml-3 flex-1">
                {endDate ? formatDate(endDate) : "No end date set"}
              </Text>
              {endDate && (
                <Pressable
                  onPress={() => setEndDate(undefined)}
                  className="p-1"
                >
                  <X size={16} color="#9ca3af" strokeWidth={1.5} />
                </Pressable>
              )}
            </Pressable>
          </View>

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={handleEndDateChange}
            />
          )}
          {Platform.OS === "ios" && showEndDatePicker && (
            <View className="flex-row justify-end mb-4">
              <Pressable
                onPress={() => setShowEndDatePicker(false)}
                className="px-4 py-2 bg-blue-500 rounded-lg"
              >
                <Text className="text-white font-medium">Done</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <Pressable
            onPress={handleSave}
            disabled={isSaving || !name.trim() || !dosageAmount.trim()}
            className={`py-4 rounded-xl ${
              isSaving || !name.trim() || !dosageAmount.trim()
                ? "bg-gray-300 dark:bg-gray-700"
                : "bg-blue-500"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                isSaving || !name.trim() || !dosageAmount.trim()
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-white"
              }`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
