import { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, TextInput, Modal, Alert, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import type { EntryType, MedicalEntry, Medication, LabRequest } from "@/types";
import { formatDate } from "@/utils";
import { ModalHeader } from "@/components/ui";
import { EntryTypeSelector } from "./EntryTypeSelector";
import { VitalsForm, type VitalsFormData } from "./VitalsForm";
import { MedicationForm, type PendingMedication } from "./MedicationForm";
import { LabRequestForm, type PendingLab } from "./LabRequestForm";
import { AttachmentUpload } from "./AttachmentUpload";

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
    labs: LabData[],
    isEdit: boolean,
    deletedMedicationIds: string[],
    deletedLabIds: string[]
  ) => Promise<void>;
  isSaving: boolean;
  existingEntry?: MedicalEntry | null;
  existingMedications?: Medication[];
  existingLabs?: LabRequest[];
}

export function AddEntryModal({
  visible,
  onClose,
  onSave,
  isSaving,
  existingEntry,
  existingMedications,
  existingLabs,
}: AddEntryModalProps) {
  const isEdit = !!existingEntry;

  // Form state
  const [entryType, setEntryType] = useState<EntryType>("prenatal_checkup");
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [vitals, setVitals] = useState<VitalsFormData>({
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

  // Pending medications and labs
  const [pendingMeds, setPendingMeds] = useState<PendingMedication[]>([]);
  const [pendingLabs, setPendingLabs] = useState<PendingLab[]>([]);

  // Track deleted existing medications and labs (for edit mode)
  const [deletedMedIds, setDeletedMedIds] = useState<string[]>([]);
  const [deletedLabIds, setDeletedLabIds] = useState<string[]>([]);

  // Attachments
  const [attachments, setAttachments] = useState<string[]>([]);

  // Initialize form with existing entry data when editing
  useEffect(() => {
    if (existingEntry && visible) {
      const [bpSys, bpDia] = existingEntry.vitals?.bloodPressure?.split("/") || ["", ""];

      setEntryType(existingEntry.entryType);
      setNotes(existingEntry.notes || "");
      setDiagnosis(existingEntry.diagnosis || "");
      setRecommendations(existingEntry.recommendations || "");
      setVitals({
        bpSystolic: bpSys,
        bpDiastolic: bpDia,
        weight: existingEntry.vitals?.weight?.toString() || "",
        fetalHeartRate: existingEntry.vitals?.fetalHeartRate?.toString() || "",
        fundalHeight: existingEntry.vitals?.fundalHeight?.toString() || "",
        aog: existingEntry.vitals?.aog || "",
      });
      setNextAppointmentDate(
        existingEntry.followUpDate ? new Date(existingEntry.followUpDate) : null
      );
      setAttachments(existingEntry.attachments || []);
    }
  }, [existingEntry, visible]);

  // Initialize pending medications from existing
  useEffect(() => {
    if (existingMedications?.length && visible) {
      const converted = existingMedications.map((med) => {
        const match = med.dosage.match(/^(\d+\.?\d*)\s*(.+)$/);
        return {
          id: med.id,
          name: med.name,
          dosageAmount: match?.[1] || "",
          dosageUnit: (match?.[2]?.trim() || "mg") as any,
          instructions: med.instructions || "",
          frequencyPerDay: med.frequencyPerDay.toString(),
          endDate: med.endDate ? new Date(med.endDate) : undefined,
          isExisting: true,
        };
      });
      setPendingMeds(converted);
    }
  }, [existingMedications, visible]);

  // Initialize pending labs from existing
  useEffect(() => {
    if (existingLabs?.length && visible) {
      setPendingLabs(
        existingLabs.map((lab) => ({
          id: lab.id,
          description: lab.description,
          notes: lab.notes || "",
          isExisting: true,
        }))
      );
    }
  }, [existingLabs, visible]);

  // Check if form has unsaved data
  const hasUnsavedChanges = useCallback(() => {
    return (
      notes !== "" ||
      diagnosis !== "" ||
      recommendations !== "" ||
      vitals.bpSystolic !== "" ||
      vitals.bpDiastolic !== "" ||
      vitals.weight !== "" ||
      vitals.fetalHeartRate !== "" ||
      vitals.fundalHeight !== "" ||
      vitals.aog !== "" ||
      nextAppointmentDate !== null ||
      pendingMeds.length > 0 ||
      pendingLabs.length > 0 ||
      attachments.length > 0
    );
  }, [notes, diagnosis, recommendations, vitals, nextAppointmentDate, pendingMeds, pendingLabs, attachments]);

  // Reset form
  const resetForm = () => {
    setEntryType("prenatal_checkup");
    setNotes("");
    setDiagnosis("");
    setRecommendations("");
    setVitals({
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
    setDeletedMedIds([]);
    setDeletedLabIds([]);
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

  // Add medication handler
  const handleAddMedication = (med: Omit<PendingMedication, "id">) => {
    setPendingMeds([...pendingMeds, { ...med, id: Date.now().toString() }]);
  };

  // Remove medication handler
  const handleRemoveMedication = (id: string) => {
    const medToRemove = pendingMeds.find((m) => m.id === id);
    if (medToRemove?.isExisting) {
      setDeletedMedIds([...deletedMedIds, id]);
    }
    setPendingMeds(pendingMeds.filter((m) => m.id !== id));
  };

  // Add lab handler
  const handleAddLab = (lab: Omit<PendingLab, "id">) => {
    setPendingLabs([...pendingLabs, { ...lab, id: Date.now().toString() }]);
  };

  // Remove lab handler
  const handleRemoveLab = (id: string) => {
    const labToRemove = pendingLabs.find((l) => l.id === id);
    if (labToRemove?.isExisting) {
      setDeletedLabIds([...deletedLabIds, id]);
    }
    setPendingLabs(pendingLabs.filter((l) => l.id !== id));
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

  // Confirm and save entry
  const handleConfirmSave = () => {
    Alert.alert(
      isEdit ? "Update Entry" : "Save Entry",
      isEdit
        ? "Are you sure you want to update this medical entry?"
        : "Are you sure you want to save this medical entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: isEdit ? "Update" : "Save", onPress: handleSave },
      ]
    );
  };

  // Build and save entry data
  const handleSave = async () => {
    const entryVitals: EntryFormData["vitals"] = {};
    if (vitals.bpSystolic && vitals.bpDiastolic) {
      entryVitals.bloodPressure = `${vitals.bpSystolic}/${vitals.bpDiastolic}`;
    }
    if (vitals.weight) entryVitals.weight = parseFloat(vitals.weight);
    if (vitals.fetalHeartRate) entryVitals.fetalHeartRate = parseInt(vitals.fetalHeartRate);
    if (vitals.fundalHeight) entryVitals.fundalHeight = parseFloat(vitals.fundalHeight);
    if (vitals.aog) entryVitals.aog = vitals.aog;

    const entryData: EntryFormData = {
      entryType,
      notes,
      diagnosis,
      recommendations,
      vitals: entryVitals,
      attachments,
      followUpDate: nextAppointmentDate || undefined,
    };

    // Only include NEW medications (not existing ones already in the database)
    const medicationsData: MedicationData[] = pendingMeds
      .filter((med) => !med.isExisting)
      .map((med) => ({
        name: med.name,
        dosage: `${med.dosageAmount} ${med.dosageUnit}`,
        instructions: med.instructions,
        frequencyPerDay: parseInt(med.frequencyPerDay) as 1 | 2 | 3 | 4,
        endDate: med.endDate,
      }));

    // Only include NEW labs (not existing ones already in the database)
    const labsData: LabData[] = pendingLabs
      .filter((lab) => !lab.isExisting)
      .map((lab) => ({
        description: lab.description,
        notes: lab.notes || undefined,
      }));

    try {
      await onSave(entryData, medicationsData, labsData, isEdit, deletedMedIds, deletedLabIds);
      resetForm();
    } catch (error) {
      // Error handling is done in parent
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <ModalHeader
          title={isEdit ? "Edit Entry" : "Add Entry"}
          onClose={handleCloseModal}
        />
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
          bottomOffset={20}
        >
          {/* Entry Type */}
          <EntryTypeSelector value={entryType} onChange={setEntryType} />

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
          <VitalsForm values={vitals} onChange={setVitals} />

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
            value={notes}
            onChangeText={setNotes}
          />

          {/* Diagnosis */}
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Diagnosis
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mb-4 text-gray-900 dark:text-white"
            placeholder="Diagnosis..."
            placeholderTextColor="#9ca3af"
            value={diagnosis}
            onChangeText={setDiagnosis}
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
            value={recommendations}
            onChangeText={setRecommendations}
          />

          {/* Medications Section */}
          <MedicationForm
            pendingMeds={pendingMeds}
            onAddMedication={handleAddMedication}
            onRemoveMedication={handleRemoveMedication}
            defaultEndDate={nextAppointmentDate}
          />

          {/* Lab Requests Section */}
          <LabRequestForm
            pendingLabs={pendingLabs}
            onAddLab={handleAddLab}
            onRemoveLab={handleRemoveLab}
          />

          {/* Attachments Section */}
          <AttachmentUpload
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />

          {/* Save Button */}
          <Pressable
            onPress={handleConfirmSave}
            disabled={isSaving}
            className={`py-4 rounded-xl items-center mt-6 mb-8 ${
              isSaving ? "bg-blue-300" : "bg-blue-500"
            }`}
          >
            <Text className="text-white font-semibold">
              {isSaving
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                ? "Update Entry"
                : "Save Entry"}
            </Text>
          </Pressable>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Modal>
  );
}
