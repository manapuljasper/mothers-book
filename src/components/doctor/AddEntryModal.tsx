import { useState, useCallback, useRef } from "react";
import type { TextInput as RNTextInput } from "react-native";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Image,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Plus,
  Pill,
  FlaskConical,
  X,
  Trash2,
  Camera,
  ImageIcon,
  Calendar,
} from "lucide-react-native";
import { ENTRY_TYPE_LABELS, type EntryType } from "@/types";
import { formatDate } from "@/utils";

const DOSAGE_UNITS = ["mg", "mcg", "g", "mL", "IU", "tablet", "capsule"] as const;
type DosageUnit = (typeof DOSAGE_UNITS)[number];

interface PendingMedication {
  id: string;
  name: string;
  dosageAmount: string;
  dosageUnit: DosageUnit;
  instructions: string;
  frequencyPerDay: string;
  endDate?: Date;
}

interface PendingLab {
  id: string;
  description: string;
  notes?: string;
}

export interface EntryFormData {
  entryType: EntryType;
  notes: string;
  diagnosis: string;
  recommendations: string;
  vitals: {
    bloodPressure?: string;
    weight?: number;
    fetalHeartRate?: number;
    fundalHeight?: number;
    aog?: string;
  };
  attachments: string[];
  followUpDate?: Date;
}

export interface MedicationData {
  name: string;
  dosage: string;
  instructions: string;
  frequencyPerDay: 1 | 2 | 3 | 4;
  endDate?: Date;
}

export interface LabData {
  description: string;
  notes?: string;
}

interface AddEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    entry: EntryFormData,
    medications: MedicationData[],
    labs: LabData[]
  ) => Promise<void>;
  isSaving: boolean;
}

export function AddEntryModal({
  visible,
  onClose,
  onSave,
  isSaving,
}: AddEntryModalProps) {
  // Form state
  const [entryForm, setEntryForm] = useState({
    entryType: "prenatal_checkup" as EntryType,
    notes: "",
    diagnosis: "",
    recommendations: "",
    bpSystolic: "",
    bpDiastolic: "",
    weight: "",
    fetalHeartRate: "",
    fundalHeight: "",
    aog: "",
  });

  // Next appointment date (optional)
  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date | null>(null);
  const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);

  // Medication end date picker state
  const [showMedEndDatePicker, setShowMedEndDatePicker] = useState(false);

  // Ref for blood pressure diastolic input
  const bpDiastolicRef = useRef<RNTextInput>(null);

  // Pending medications and labs
  const [pendingMeds, setPendingMeds] = useState<PendingMedication[]>([]);
  const [pendingLabs, setPendingLabs] = useState<PendingLab[]>([]);

  // Current medication being added
  const [currentMed, setCurrentMed] = useState({
    name: "",
    dosageAmount: "",
    dosageUnit: "mg" as DosageUnit,
    instructions: "",
    frequencyPerDay: "1",
    endDate: null as Date | null,
  });

  // Current lab being added
  const [currentLab, setCurrentLab] = useState({
    description: "",
    notes: "",
  });

  // Attachments
  const [attachments, setAttachments] = useState<string[]>([]);

  // Check if form has unsaved data
  const hasUnsavedChanges = useCallback(() => {
    return (
      entryForm.notes !== "" ||
      entryForm.diagnosis !== "" ||
      entryForm.recommendations !== "" ||
      entryForm.bpSystolic !== "" ||
      entryForm.bpDiastolic !== "" ||
      entryForm.weight !== "" ||
      entryForm.fetalHeartRate !== "" ||
      entryForm.fundalHeight !== "" ||
      entryForm.aog !== "" ||
      nextAppointmentDate !== null ||
      pendingMeds.length > 0 ||
      pendingLabs.length > 0 ||
      attachments.length > 0
    );
  }, [entryForm, nextAppointmentDate, pendingMeds, pendingLabs, attachments]);

  // Reset form
  const resetForm = () => {
    setEntryForm({
      entryType: "prenatal_checkup",
      notes: "",
      diagnosis: "",
      recommendations: "",
      bpSystolic: "",
      bpDiastolic: "",
      weight: "",
      fetalHeartRate: "",
      fundalHeight: "",
      aog: "",
    });
    setNextAppointmentDate(null);
    setPendingMeds([]);
    setPendingLabs([]);
    setCurrentMed({
      name: "",
      dosageAmount: "",
      dosageUnit: "mg",
      instructions: "",
      frequencyPerDay: "1",
      endDate: null,
    });
    setCurrentLab({ description: "", notes: "" });
    setAttachments([]);
  };

  // Handle modal close with confirmation
  const handleCloseModal = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  // Image picker - take photo
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments([...attachments, result.assets[0].uri]);
    }
  };

  // Image picker - choose from gallery
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library permission is needed to select photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((asset) => asset.uri);
      setAttachments([...attachments, ...newUris]);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Add medication to pending list
  const handleAddMedToPending = () => {
    if (!currentMed.name || !currentMed.dosageAmount) return;

    // If no end date specified, use next appointment date as default
    const endDate = currentMed.endDate || nextAppointmentDate || undefined;

    setPendingMeds([
      ...pendingMeds,
      {
        ...currentMed,
        id: Date.now().toString(),
        endDate: endDate || undefined,
      },
    ]);
    setCurrentMed({
      name: "",
      dosageAmount: "",
      dosageUnit: "mg",
      instructions: "",
      frequencyPerDay: "1",
      endDate: null,
    });
  };

  // Remove medication from pending list
  const handleRemovePendingMed = (id: string) => {
    setPendingMeds(pendingMeds.filter((m) => m.id !== id));
  };

  // Add lab to pending list
  const handleAddLabToPending = () => {
    if (!currentLab.description) return;
    setPendingLabs([
      ...pendingLabs,
      { ...currentLab, id: Date.now().toString() },
    ]);
    setCurrentLab({ description: "", notes: "" });
  };

  // Remove lab from pending list
  const handleRemovePendingLab = (id: string) => {
    setPendingLabs(pendingLabs.filter((l) => l.id !== id));
  };

  // Confirm and save entry
  const handleConfirmSave = () => {
    Alert.alert(
      "Save Entry",
      "Are you sure you want to save this medical entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: handleSave },
      ]
    );
  };

  // Build and save entry data
  const handleSave = async () => {

    const vitals: EntryFormData["vitals"] = {};
    if (entryForm.bpSystolic && entryForm.bpDiastolic) {
      vitals.bloodPressure = `${entryForm.bpSystolic}/${entryForm.bpDiastolic}`;
    }
    if (entryForm.weight) vitals.weight = parseFloat(entryForm.weight);
    if (entryForm.fetalHeartRate)
      vitals.fetalHeartRate = parseInt(entryForm.fetalHeartRate);
    if (entryForm.fundalHeight)
      vitals.fundalHeight = parseFloat(entryForm.fundalHeight);
    if (entryForm.aog) vitals.aog = entryForm.aog;

    const entryData: EntryFormData = {
      entryType: entryForm.entryType,
      notes: entryForm.notes,
      diagnosis: entryForm.diagnosis,
      recommendations: entryForm.recommendations,
      vitals,
      attachments,
      followUpDate: nextAppointmentDate || undefined,
    };

    const medicationsData: MedicationData[] = pendingMeds.map((med) => ({
      name: med.name,
      dosage: `${med.dosageAmount} ${med.dosageUnit}`,
      instructions: med.instructions,
      frequencyPerDay: parseInt(med.frequencyPerDay) as 1 | 2 | 3 | 4,
      endDate: med.endDate,
    }));

    const labsData: LabData[] = pendingLabs.map((lab) => ({
      description: lab.description,
      notes: lab.notes || undefined,
    }));

    try {
      await onSave(entryData, medicationsData, labsData);
      resetForm();
    } catch (error) {
      // Error handling is done in parent
    }
  };

  // Handle appointment date change
  const handleAppointmentDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowAppointmentPicker(false);
    }
    if (selectedDate) {
      setNextAppointmentDate(selectedDate);
    }
  };

  // Handle medication end date change
  const handleMedEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowMedEndDatePicker(false);
    }
    if (selectedDate) {
      setCurrentMed({ ...currentMed, endDate: selectedDate });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Add Entry
          </Text>
          <Pressable onPress={handleCloseModal}>
            <X size={24} color="#6b7280" strokeWidth={1.5} />
          </Pressable>
        </View>
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
          bottomOffset={20}
        >
          {/* Entry Type */}
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Entry Type
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {(Object.keys(ENTRY_TYPE_LABELS) as EntryType[]).map((type) => (
              <Pressable
                key={type}
                onPress={() => setEntryForm({ ...entryForm, entryType: type })}
                className={`px-4 py-2 rounded-full mr-2 border ${
                  entryForm.entryType === type
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={
                    entryForm.entryType === type
                      ? "text-white font-medium"
                      : "text-gray-600 dark:text-gray-300"
                  }
                >
                  {ENTRY_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Next Appointment Date (Optional) */}
          <View className="mb-4">
            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              Next Appointment (optional)
            </Text>
            <Pressable
              onPress={() => setShowAppointmentPicker(true)}
              className={`flex-row items-center border rounded-lg px-3 py-3 ${
                nextAppointmentDate
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <Calendar
                size={18}
                color={nextAppointmentDate ? "#3b82f6" : "#9ca3af"}
                strokeWidth={1.5}
              />
              <Text
                className={`ml-2 ${
                  nextAppointmentDate
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-400"
                }`}
              >
                {nextAppointmentDate
                  ? formatDate(nextAppointmentDate)
                  : "Select next appointment date"}
              </Text>
            </Pressable>
            {showAppointmentPicker && (
              <DateTimePicker
                value={nextAppointmentDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={handleAppointmentDateChange}
              />
            )}
            {Platform.OS === "ios" && showAppointmentPicker && (
              <View className="flex-row justify-end mt-2">
                <Pressable
                  onPress={() => setShowAppointmentPicker(false)}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Done</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Vitals */}
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2 mt-2">
            Vitals
          </Text>
          <View className="flex-row flex-wrap">
            <View className="w-1/2 pr-2 mb-3">
              <Text className="text-gray-400 text-xs mb-1">Blood Pressure</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex-1 text-gray-900 dark:text-white"
                  placeholder="120"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={3}
                  returnKeyType="next"
                  value={entryForm.bpSystolic}
                  onChangeText={(v) =>
                    setEntryForm({ ...entryForm, bpSystolic: v })
                  }
                  onSubmitEditing={() => bpDiastolicRef.current?.focus()}
                />
                <Text className="text-gray-400 text-lg mx-2">/</Text>
                <TextInput
                  ref={bpDiastolicRef}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex-1 text-gray-900 dark:text-white"
                  placeholder="80"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={3}
                  value={entryForm.bpDiastolic}
                  onChangeText={(v) =>
                    setEntryForm({ ...entryForm, bpDiastolic: v })
                  }
                />
              </View>
            </View>
            <View className="w-1/2 pl-2 mb-3">
              <Text className="text-gray-400 text-xs mb-1">Weight (kg)</Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                placeholder="65"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={entryForm.weight}
                onChangeText={(v) => setEntryForm({ ...entryForm, weight: v })}
              />
            </View>
            <View className="w-1/2 pr-2 mb-3">
              <Text className="text-gray-400 text-xs mb-1">FHR (bpm)</Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                placeholder="140"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={entryForm.fetalHeartRate}
                onChangeText={(v) =>
                  setEntryForm({ ...entryForm, fetalHeartRate: v })
                }
              />
            </View>
            <View className="w-1/2 pl-2 mb-3">
              <Text className="text-gray-400 text-xs mb-1">
                Fundal Height (cm)
              </Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                placeholder="28"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={entryForm.fundalHeight}
                onChangeText={(v) =>
                  setEntryForm({ ...entryForm, fundalHeight: v })
                }
              />
            </View>
            <View className="w-full mb-3">
              <Text className="text-gray-400 text-xs mb-1">AOG</Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                placeholder="28 weeks 3 days"
                placeholderTextColor="#9ca3af"
                value={entryForm.aog}
                onChangeText={(v) => setEntryForm({ ...entryForm, aog: v })}
              />
            </View>
          </View>

          {/* Notes */}
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2 mt-2">
            Notes
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mb-4 text-gray-900 dark:text-white"
            placeholder="Clinical notes..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={entryForm.notes}
            onChangeText={(v) => setEntryForm({ ...entryForm, notes: v })}
          />

          {/* Diagnosis */}
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Diagnosis
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mb-4 text-gray-900 dark:text-white"
            placeholder="Diagnosis..."
            placeholderTextColor="#9ca3af"
            value={entryForm.diagnosis}
            onChangeText={(v) => setEntryForm({ ...entryForm, diagnosis: v })}
          />

          {/* Recommendations */}
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Recommendations
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mb-4 text-gray-900 dark:text-white"
            placeholder="Recommendations..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            value={entryForm.recommendations}
            onChangeText={(v) =>
              setEntryForm({ ...entryForm, recommendations: v })
            }
          />

          {/* Medications Section */}
          <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
            <View className="flex-row items-center mb-3">
              <Pill size={18} color="#22c55e" strokeWidth={1.5} />
              <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
                Prescriptions
              </Text>
            </View>

            {/* Pending medications list */}
            {pendingMeds.length > 0 && (
              <View className="mb-3">
                {pendingMeds.map((med) => (
                  <View
                    key={med.id}
                    className="flex-row items-center justify-between bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-2"
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {med.name}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        {med.dosageAmount} {med.dosageUnit} •{" "}
                        {med.frequencyPerDay}x daily
                        {med.endDate && ` • Until ${formatDate(med.endDate)}`}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleRemovePendingMed(med.id)}>
                      <Trash2 size={18} color="#ef4444" strokeWidth={1.5} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Add medication form */}
            <View className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
              {/* Medication name */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Medication</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Folic Acid"
                  placeholderTextColor="#9ca3af"
                  value={currentMed.name}
                  onChangeText={(v) =>
                    setCurrentMed({ ...currentMed, name: v })
                  }
                />
              </View>

              {/* Dosage amount and unit */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Dosage</Text>
                <View className="flex-row">
                  <TextInput
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 w-20 mr-2 text-gray-900 dark:text-white"
                    placeholder="400"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={currentMed.dosageAmount}
                    onChangeText={(v) =>
                      setCurrentMed({ ...currentMed, dosageAmount: v })
                    }
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-1"
                  >
                    {DOSAGE_UNITS.map((unit) => (
                      <Pressable
                        key={unit}
                        onPress={() =>
                          setCurrentMed({ ...currentMed, dosageUnit: unit })
                        }
                        className={`px-3 py-2 mr-1 rounded-lg border ${
                          currentMed.dosageUnit === unit
                            ? "bg-green-500 border-green-500"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <Text
                          className={
                            currentMed.dosageUnit === unit
                              ? "text-white text-sm"
                              : "text-gray-600 dark:text-gray-300 text-sm"
                          }
                        >
                          {unit}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Frequency and Instructions */}
              <View className="flex-row mb-3">
                <View className="flex-1 pr-2">
                  <Text className="text-gray-400 text-xs mb-1">Frequency</Text>
                  <View className="flex-row">
                    {["1", "2", "3", "4"].map((freq) => (
                      <Pressable
                        key={freq}
                        onPress={() =>
                          setCurrentMed({ ...currentMed, frequencyPerDay: freq })
                        }
                        className={`px-3 py-2 mr-1 rounded-lg border ${
                          currentMed.frequencyPerDay === freq
                            ? "bg-green-500 border-green-500"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <Text
                          className={
                            currentMed.frequencyPerDay === freq
                              ? "text-white text-sm"
                              : "text-gray-600 dark:text-gray-300 text-sm"
                          }
                        >
                          {freq}x
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-gray-400 text-xs mb-1">Instructions</Text>
                  <TextInput
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., With food"
                    placeholderTextColor="#9ca3af"
                    value={currentMed.instructions}
                    onChangeText={(v) =>
                      setCurrentMed({ ...currentMed, instructions: v })
                    }
                  />
                </View>
              </View>

              {/* End Date (optional) */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">
                  End Date (optional, defaults to next appointment)
                </Text>
                <Pressable
                  onPress={() => setShowMedEndDatePicker(true)}
                  className={`flex-row items-center border rounded-lg px-3 py-2 ${
                    currentMed.endDate
                      ? "border-green-400 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  }`}
                >
                  <Calendar
                    size={16}
                    color={currentMed.endDate ? "#22c55e" : "#9ca3af"}
                    strokeWidth={1.5}
                  />
                  <Text
                    className={`ml-2 text-sm ${
                      currentMed.endDate
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {currentMed.endDate
                      ? formatDate(currentMed.endDate)
                      : nextAppointmentDate
                      ? `Default: ${formatDate(nextAppointmentDate)}`
                      : "Set end date"}
                  </Text>
                  {currentMed.endDate && (
                    <Pressable
                      onPress={() => setCurrentMed({ ...currentMed, endDate: null })}
                      className="ml-auto"
                    >
                      <X size={16} color="#9ca3af" strokeWidth={1.5} />
                    </Pressable>
                  )}
                </Pressable>
                {showMedEndDatePicker && (
                  <DateTimePicker
                    value={currentMed.endDate || nextAppointmentDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={new Date()}
                    onChange={handleMedEndDateChange}
                  />
                )}
                {Platform.OS === "ios" && showMedEndDatePicker && (
                  <View className="flex-row justify-end mt-2">
                    <Pressable
                      onPress={() => setShowMedEndDatePicker(false)}
                      className="bg-green-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-medium">Done</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <Pressable
                onPress={handleAddMedToPending}
                disabled={!currentMed.name || !currentMed.dosageAmount}
                className={`flex-row items-center justify-center py-2 rounded-lg ${
                  currentMed.name && currentMed.dosageAmount
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              >
                <Plus
                  size={16}
                  color={
                    currentMed.name && currentMed.dosageAmount
                      ? "white"
                      : "#9ca3af"
                  }
                  strokeWidth={1.5}
                />
                <Text
                  className={`ml-1 font-medium ${
                    currentMed.name && currentMed.dosageAmount
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  Add Medication
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Lab Requests Section */}
          <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
            <View className="flex-row items-center mb-3">
              <FlaskConical size={18} color="#f59e0b" strokeWidth={1.5} />
              <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
                Lab Requests
              </Text>
            </View>

            {/* Pending labs list */}
            {pendingLabs.length > 0 && (
              <View className="mb-3">
                {pendingLabs.map((lab) => (
                  <View
                    key={lab.id}
                    className="flex-row items-center justify-between bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-2"
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {lab.description}
                      </Text>
                      {lab.notes && (
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                          {lab.notes}
                        </Text>
                      )}
                    </View>
                    <Pressable onPress={() => handleRemovePendingLab(lab.id)}>
                      <Trash2 size={18} color="#ef4444" strokeWidth={1.5} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Add lab form */}
            <View className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
              <Text className="text-gray-400 text-xs mb-1">Lab Test</Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 mb-3 text-gray-900 dark:text-white"
                placeholder="e.g., Complete Blood Count (CBC)"
                placeholderTextColor="#9ca3af"
                value={currentLab.description}
                onChangeText={(v) =>
                  setCurrentLab({ ...currentLab, description: v })
                }
              />
              <Text className="text-gray-400 text-xs mb-1">Notes (optional)</Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 mb-3 text-gray-900 dark:text-white"
                placeholder="Additional instructions..."
                placeholderTextColor="#9ca3af"
                value={currentLab.notes}
                onChangeText={(v) =>
                  setCurrentLab({ ...currentLab, notes: v })
                }
              />
              <Pressable
                onPress={handleAddLabToPending}
                disabled={!currentLab.description}
                className={`flex-row items-center justify-center py-2 rounded-lg ${
                  currentLab.description ? "bg-amber-500" : "bg-gray-200"
                }`}
              >
                <Plus
                  size={16}
                  color={currentLab.description ? "white" : "#9ca3af"}
                  strokeWidth={1.5}
                />
                <Text
                  className={`ml-1 font-medium ${
                    currentLab.description ? "text-white" : "text-gray-400"
                  }`}
                >
                  Add Lab Request
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Attachments Section */}
          <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
            <View className="flex-row items-center mb-3">
              <ImageIcon size={18} color="#6366f1" strokeWidth={1.5} />
              <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
                Attachments
              </Text>
            </View>

            {/* Display selected photos */}
            {attachments.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3"
              >
                {attachments.map((uri, index) => (
                  <View key={index} className="mr-2 relative">
                    <Image
                      source={{ uri }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => handleRemoveAttachment(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <X size={12} color="white" strokeWidth={2} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Photo picker buttons */}
            <View className="flex-row">
              <Pressable
                onPress={handleTakePhoto}
                className="flex-1 flex-row items-center justify-center border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800 px-3 py-3 rounded-xl mr-2"
              >
                <Camera size={18} color="#6366f1" strokeWidth={1.5} />
                <Text className="text-indigo-600 dark:text-indigo-400 font-medium ml-2">
                  Take Photo
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePickImage}
                className="flex-1 flex-row items-center justify-center border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800 px-3 py-3 rounded-xl"
              >
                <ImageIcon size={18} color="#6366f1" strokeWidth={1.5} />
                <Text className="text-indigo-600 dark:text-indigo-400 font-medium ml-2">
                  Gallery
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleConfirmSave}
            disabled={isSaving}
            className={`py-4 rounded-xl items-center mt-6 mb-8 ${
              isSaving ? "bg-blue-300" : "bg-blue-500"
            }`}
          >
            <Text className="text-white font-semibold">
              {isSaving ? "Saving..." : "Save Entry"}
            </Text>
          </Pressable>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Modal>
  );
}
