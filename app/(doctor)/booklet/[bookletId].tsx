import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { TextInput as RNTextInput } from "react-native";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert, Image, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Pill,
  FlaskConical,
  X,
  Trash2,
  Camera,
  ImageIcon,
} from "lucide-react-native";
import { useAuthStore } from "../../../src/stores";
import { formatDate } from "../../../src/utils";
import {
  ENTRY_TYPE_LABELS,
  LAB_STATUS_LABELS,
  EntryType,
} from "../../../src/types";
import { CardPressable, AnimatedCollapsible } from "../../../src/components/ui";
import {
  useBookletsByDoctor,
  useEntriesByBooklet,
  useLabsByEntry,
  useLabsByBooklet,
  usePendingLabs,
  useMedicationsByBooklet,
  useCreateEntry,
  useCreateMedication,
  useCreateLabRequest,
} from "../../../src/hooks";

const DOSAGE_UNITS = ["mg", "mcg", "g", "mL", "IU", "tablet", "capsule"] as const;
type DosageUnit = typeof DOSAGE_UNITS[number];

interface PendingMedication {
  id: string;
  name: string;
  dosageAmount: string;
  dosageUnit: DosageUnit;
  instructions: string;
  frequencyPerDay: string;
}

interface PendingLab {
  id: string;
  description: string;
  notes?: string;
}

export default function DoctorBookletDetailScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { doctorProfile } = useAuthStore();

  // React Query hooks for data fetching
  const { data: doctorBooklets = [], isLoading: isLoadingBooklets } =
    useBookletsByDoctor(doctorProfile?.id);
  const { data: entries = [], isLoading: isLoadingEntries } =
    useEntriesByBooklet(bookletId);
  const { data: allMedications = [], isLoading: isLoadingMedications } =
    useMedicationsByBooklet(bookletId);
  const { data: bookletPendingLabs = [] } = usePendingLabs(bookletId);

  // Mutation hooks
  const createEntryMutation = useCreateEntry();
  const createMedicationMutation = useCreateMedication();
  const createLabRequestMutation = useCreateLabRequest();

  // Get booklet with mother info
  const booklet = doctorBooklets.find((b) => b.id === bookletId);

  const isLoading = isLoadingBooklets || isLoadingEntries || isLoadingMedications;

  // Get sorted unique dates from entries
  const visitDates = useMemo(() => {
    const dateStrings = entries.map((e) => {
      const d = e.visitDate;
      return typeof d === "string" ? d : new Date(d).toISOString().split("T")[0];
    });
    return [...new Set(dateStrings)].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [entries]);

  // State
  const [selectedDate, setSelectedDate] = useState<string | null>(
    visitDates[0] || null
  );
  const [medsExpanded, setMedsExpanded] = useState(true);
  const [labsExpanded, setLabsExpanded] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Form state for Add Entry (includes pending meds and labs)
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

  // Ref for blood pressure diastolic input (for keyboard navigation)
  const bpDiastolicRef = useRef<RNTextInput>(null);

  // Pending medications and labs to be created with the entry
  const [pendingMeds, setPendingMeds] = useState<PendingMedication[]>([]);
  const [pendingLabs, setPendingLabs] = useState<PendingLab[]>([]);

  // Current medication being added
  const [currentMed, setCurrentMed] = useState({
    name: "",
    dosageAmount: "",
    dosageUnit: "mg" as DosageUnit,
    instructions: "",
    frequencyPerDay: "1",
  });

  // Current lab being added
  const [currentLab, setCurrentLab] = useState({
    description: "",
    notes: "",
  });

  // Attachments (photos)
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
      pendingMeds.length > 0 ||
      pendingLabs.length > 0 ||
      attachments.length > 0
    );
  }, [entryForm, pendingMeds, pendingLabs, attachments]);

  // Image picker - take photo
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is needed to take photos.");
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
      Alert.alert("Permission Required", "Photo library permission is needed to select photos.");
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
              setShowEntryModal(false);
            },
          },
        ]
      );
    } else {
      setShowEntryModal(false);
    }
  };

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
    setPendingMeds([]);
    setPendingLabs([]);
    setCurrentMed({ name: "", dosageAmount: "", dosageUnit: "mg", instructions: "", frequencyPerDay: "1" });
    setCurrentLab({ description: "", notes: "" });
    setAttachments([]);
  };

  // Get entry for selected date
  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null;
    return (
      entries.find((e) => {
        const d = e.visitDate;
        const dateStr =
          typeof d === "string" ? d : new Date(d).toISOString().split("T")[0];
        return dateStr === selectedDate;
      }) || null
    );
  }, [entries, selectedDate]);

  // Fetch labs for the selected entry
  const { data: selectedEntryLabs = [] } = useLabsByEntry(selectedEntry?.id);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-400 mt-2">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!booklet || !doctorProfile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-400">Booklet not found</Text>
      </SafeAreaView>
    );
  }

  const activeMeds = allMedications.filter((m) => m.isActive);

  const getMedsForEntry = (entryId: string) => {
    return allMedications.filter((m) => m.medicalEntryId === entryId);
  };

  // Add medication to pending list
  const handleAddMedToPending = () => {
    if (!currentMed.name || !currentMed.dosageAmount) return;
    setPendingMeds([
      ...pendingMeds,
      { ...currentMed, id: Date.now().toString() },
    ]);
    setCurrentMed({ name: "", dosageAmount: "", dosageUnit: "mg", instructions: "", frequencyPerDay: "1" });
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
        { text: "Save", onPress: saveEntry },
      ]
    );
  };

  // Actually save the entry using mutations
  const saveEntry = async () => {
    const vitals: Record<string, string | number | undefined> = {};
    if (entryForm.bpSystolic && entryForm.bpDiastolic) {
      vitals.bloodPressure = `${entryForm.bpSystolic}/${entryForm.bpDiastolic}`;
    }
    if (entryForm.weight) vitals.weight = parseFloat(entryForm.weight);
    if (entryForm.fetalHeartRate)
      vitals.fetalHeartRate = parseInt(entryForm.fetalHeartRate);
    if (entryForm.fundalHeight)
      vitals.fundalHeight = parseFloat(entryForm.fundalHeight);
    if (entryForm.aog) vitals.aog = entryForm.aog;

    try {
      // Create the entry using mutation and get the result
      const newEntry = await createEntryMutation.mutateAsync({
        bookletId,
        doctorId: doctorProfile.id,
        entryType: entryForm.entryType,
        visitDate: new Date(),
        notes: entryForm.notes,
        diagnosis: entryForm.diagnosis || undefined,
        recommendations: entryForm.recommendations || undefined,
        vitals: Object.keys(vitals).length > 0 ? vitals : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      // Create all pending medications linked to this entry
      await Promise.all(
        pendingMeds.map((med) =>
          createMedicationMutation.mutateAsync({
            medicalEntryId: newEntry.id,
            bookletId,
            createdByDoctorId: doctorProfile.id,
            name: med.name,
            dosage: `${med.dosageAmount} ${med.dosageUnit}`,
            instructions: med.instructions,
            startDate: new Date(),
            frequencyPerDay: parseInt(med.frequencyPerDay) as 1 | 2 | 3 | 4,
            isActive: true,
          })
        )
      );

      // Create all pending lab requests linked to this entry
      await Promise.all(
        pendingLabs.map((lab) =>
          createLabRequestMutation.mutateAsync({
            medicalEntryId: newEntry.id,
            bookletId,
            description: lab.description,
            status: "pending",
            requestedDate: new Date(),
            notes: lab.notes || undefined,
          })
        )
      );

      // Reset form and close modal
      resetForm();
      setShowEntryModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save entry. Please try again.");
      console.error("Save entry error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="bg-blue-500 px-6 py-6" style={{ paddingTop: insets.top }}>
          <CardPressable
            onPress={() => router.back()}
            className="flex-row items-center mb-3"
          >
            <ChevronLeft size={20} color="#bfdbfe" strokeWidth={1.5} />
            <Text className="text-blue-200 ml-1">Back</Text>
          </CardPressable>
          <Text className="text-white text-2xl font-bold">
            {booklet.motherName}
          </Text>
          <Text className="text-blue-200">{booklet.label}</Text>
          <View className="flex-row items-center mt-2">
            <View
              className={`px-2 py-1 rounded-full border ${
                booklet.status === "active"
                  ? "border-white/50"
                  : "border-white/30"
              }`}
            >
              <Text className="text-white text-xs font-medium">
                {booklet.status}
              </Text>
            </View>
            {booklet.expectedDueDate && (
              <Text className="text-blue-200 ml-3">
                Due: {formatDate(booklet.expectedDueDate)}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row px-4 -mt-4">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 mx-1 border border-gray-100 dark:border-gray-700">
            <Text className="text-2xl font-bold text-blue-500">
              {entries.length}
            </Text>
            <Text className="text-gray-400 text-xs">Visits</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 mx-1 border border-gray-100 dark:border-gray-700">
            <Text className="text-2xl font-bold text-green-500">
              {activeMeds.length}
            </Text>
            <Text className="text-gray-400 text-xs">Active Meds</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 mx-1 border border-gray-100 dark:border-gray-700">
            <Text className="text-2xl font-bold text-amber-500">
              {bookletPendingLabs.length}
            </Text>
            <Text className="text-gray-400 text-xs">Pending Labs</Text>
          </View>
        </View>

        {/* Add Entry Button */}
        <View className="px-6 mt-6">
          <Pressable
            onPress={() => setShowEntryModal(true)}
            className="flex-row items-center justify-center bg-blue-500 px-4 py-3 rounded-xl"
          >
            <Plus size={18} color="white" strokeWidth={1.5} />
            <Text className="text-white font-medium ml-2">Add Entry</Text>
          </Pressable>
        </View>

        {/* Visit History */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Visit History
          </Text>
          {visitDates.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <Text className="text-gray-400 text-center">No visits yet</Text>
              <Text className="text-gray-300 dark:text-gray-500 text-sm text-center mt-1">
                Add your first entry above
              </Text>
            </View>
          ) : (
            <>
              {/* Horizontal Date Selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                {visitDates.map((date) => {
                  const isSelected = date === selectedDate;
                  const dateObj = new Date(date);
                  const day = dateObj.getDate();
                  const month = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                  });

                  return (
                    <Pressable
                      key={date}
                      onPress={() => setSelectedDate(date)}
                      className={`items-center justify-center px-4 py-3 mr-2 rounded-xl border ${
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          isSelected ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        {month}
                      </Text>
                      <Text
                        className={`text-xl font-bold ${
                          isSelected ? "text-white" : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Selected Entry Display */}
              {selectedEntry && (
                <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
                  {/* Entry Header */}
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 dark:text-white text-lg">
                        {ENTRY_TYPE_LABELS[selectedEntry.entryType]}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {selectedEntry.doctorName}
                      </Text>
                    </View>
                    <View className="border border-blue-300 dark:border-blue-500 px-3 py-1 rounded-full">
                      <Text className="text-blue-500 text-sm font-medium">
                        {formatDate(selectedEntry.visitDate)}
                      </Text>
                    </View>
                  </View>

                  {/* Vitals */}
                  {selectedEntry.vitals &&
                    Object.keys(selectedEntry.vitals).length > 0 && (
                      <View className="flex-row flex-wrap mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {selectedEntry.vitals.bloodPressure && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">BP</Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.bloodPressure}
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.weight && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">Weight</Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.weight} kg
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.fetalHeartRate && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">FHR</Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.fetalHeartRate} bpm
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.fundalHeight && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">
                              Fundal Height
                            </Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.fundalHeight} cm
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.aog && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">AOG</Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.aog}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                  {/* Notes */}
                  {selectedEntry.notes && (
                    <Text className="text-gray-600 dark:text-gray-300 text-sm mt-3">
                      {selectedEntry.notes}
                    </Text>
                  )}

                  {/* Diagnosis */}
                  {selectedEntry.diagnosis && (
                    <View className="mt-3 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                      <Text className="text-blue-600 dark:text-blue-400 text-sm">
                        <Text className="font-semibold">Diagnosis: </Text>
                        {selectedEntry.diagnosis}
                      </Text>
                    </View>
                  )}

                  {/* Recommendations */}
                  {selectedEntry.recommendations && (
                    <View className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <Text className="text-gray-600 dark:text-gray-300 text-sm">
                        <Text className="font-semibold">Recommendations: </Text>
                        {selectedEntry.recommendations}
                      </Text>
                    </View>
                  )}

                  {/* Medications */}
                  {getMedsForEntry(selectedEntry.id).length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Pressable
                        onPress={() => setMedsExpanded(!medsExpanded)}
                        className="flex-row justify-between items-center"
                      >
                        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Medications (
                          {getMedsForEntry(selectedEntry.id).length})
                        </Text>
                        {medsExpanded ? (
                          <ChevronUp
                            size={16}
                            color="#9ca3af"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            color="#9ca3af"
                            strokeWidth={1.5}
                          />
                        )}
                      </Pressable>
                      <AnimatedCollapsible expanded={medsExpanded}>
                        <View className="pt-2">
                          {getMedsForEntry(selectedEntry.id).map((med) => (
                            <View
                              key={med.id}
                              className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 mb-2"
                            >
                              <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                  <Text className="font-medium text-gray-900 dark:text-white">
                                    {med.name}
                                  </Text>
                                  <Text className="text-gray-400 text-sm">
                                    {med.dosage} • {med.frequencyPerDay}x daily
                                  </Text>
                                </View>
                                <View
                                  className={`px-2 py-1 rounded-full border ${
                                    med.isActive
                                      ? "border-green-400"
                                      : "border-gray-300 dark:border-gray-600"
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      med.isActive
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {med.isActive ? "Active" : "Done"}
                                  </Text>
                                </View>
                              </View>
                              {med.instructions && (
                                <Text className="text-gray-400 text-xs mt-1">
                                  {med.instructions}
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      </AnimatedCollapsible>
                    </View>
                  )}

                  {/* Labs */}
                  {selectedEntryLabs.length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Pressable
                        onPress={() => setLabsExpanded(!labsExpanded)}
                        className="flex-row justify-between items-center"
                      >
                        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Lab Requests (
                          {selectedEntryLabs.length})
                        </Text>
                        {labsExpanded ? (
                          <ChevronUp
                            size={16}
                            color="#9ca3af"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            color="#9ca3af"
                            strokeWidth={1.5}
                          />
                        )}
                      </Pressable>
                      <AnimatedCollapsible expanded={labsExpanded}>
                        <View className="pt-2">
                          {selectedEntryLabs.map((lab) => (
                            <View
                              key={lab.id}
                              className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 mb-2"
                            >
                              <View className="flex-row justify-between items-start">
                                <Text className="font-medium text-gray-900 dark:text-white flex-1">
                                  {lab.description}
                                </Text>
                                <View
                                  className={`px-2 py-1 rounded-full border ${
                                    lab.status === "completed"
                                      ? "border-green-400"
                                      : lab.status === "pending"
                                      ? "border-amber-400"
                                      : "border-gray-300 dark:border-gray-600"
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      lab.status === "completed"
                                        ? "text-green-600 dark:text-green-400"
                                        : lab.status === "pending"
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {LAB_STATUS_LABELS[lab.status]}
                                  </Text>
                                </View>
                              </View>
                              {lab.results && (
                                <Text className="text-green-600 dark:text-green-400 text-sm mt-2">
                                  <Text className="font-medium">Results: </Text>
                                  {lab.results}
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      </AnimatedCollapsible>
                    </View>
                  )}

                  {/* Follow-up */}
                  {selectedEntry.followUpDate && (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Text className="text-gray-500 text-sm">
                        Follow-up: {formatDate(selectedEntry.followUpDate)}
                      </Text>
                    </View>
                  )}

                  {/* Attachments */}
                  {selectedEntry.attachments && selectedEntry.attachments.length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Attachments ({selectedEntry.attachments.length})
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedEntry.attachments.map((uri, index) => (
                          <Pressable
                            key={index}
                            onPress={() => {
                              // Could open full-screen image viewer here
                            }}
                            className="mr-2"
                          >
                            <Image
                              source={{ uri }}
                              className="w-16 h-16 rounded-lg"
                              resizeMode="cover"
                            />
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Entry Modal */}
      <Modal
        visible={showEntryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">Add Entry</Text>
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
            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">Entry Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
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

            {/* Vitals */}
            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2 mt-2">Vitals</Text>
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
                    onChangeText={(v) => setEntryForm({ ...entryForm, bpSystolic: v })}
                    onSubmitEditing={() => bpDiastolicRef.current?.focus()}
                    blurOnSubmit={false}
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
                    onChangeText={(v) => setEntryForm({ ...entryForm, bpDiastolic: v })}
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
                  onChangeText={(v) => setEntryForm({ ...entryForm, fetalHeartRate: v })}
                />
              </View>
              <View className="w-1/2 pl-2 mb-3">
                <Text className="text-gray-400 text-xs mb-1">Fundal Height (cm)</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="28"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={entryForm.fundalHeight}
                  onChangeText={(v) => setEntryForm({ ...entryForm, fundalHeight: v })}
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
            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2 mt-2">Notes</Text>
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
            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">Diagnosis</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mb-4 text-gray-900 dark:text-white"
              placeholder="Diagnosis..."
              placeholderTextColor="#9ca3af"
              value={entryForm.diagnosis}
              onChangeText={(v) => setEntryForm({ ...entryForm, diagnosis: v })}
            />

            {/* Recommendations */}
            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">Recommendations</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mb-4 text-gray-900 dark:text-white"
              placeholder="Recommendations..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              value={entryForm.recommendations}
              onChangeText={(v) => setEntryForm({ ...entryForm, recommendations: v })}
            />

            {/* Medications Section */}
            <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
              <View className="flex-row items-center mb-3">
                <Pill size={18} color="#22c55e" strokeWidth={1.5} />
                <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">Prescriptions</Text>
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
                        <Text className="font-medium text-gray-900 dark:text-white">{med.name}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                          {med.dosageAmount} {med.dosageUnit} • {med.frequencyPerDay}x daily
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
                    onChangeText={(v) => setCurrentMed({ ...currentMed, name: v })}
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
                      onChangeText={(v) => setCurrentMed({ ...currentMed, dosageAmount: v })}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                      {DOSAGE_UNITS.map((unit) => (
                        <Pressable
                          key={unit}
                          onPress={() => setCurrentMed({ ...currentMed, dosageUnit: unit })}
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
                          onPress={() => setCurrentMed({ ...currentMed, frequencyPerDay: freq })}
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
                      onChangeText={(v) => setCurrentMed({ ...currentMed, instructions: v })}
                    />
                  </View>
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
                    color={currentMed.name && currentMed.dosageAmount ? "white" : "#9ca3af"}
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
                <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">Lab Requests</Text>
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
                        <Text className="font-medium text-gray-900 dark:text-white">{lab.description}</Text>
                        {lab.notes && (
                          <Text className="text-gray-500 dark:text-gray-400 text-sm">{lab.notes}</Text>
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
                  onChangeText={(v) => setCurrentLab({ ...currentLab, description: v })}
                />
                <Text className="text-gray-400 text-xs mb-1">Notes (optional)</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 mb-3 text-gray-900 dark:text-white"
                  placeholder="Additional instructions..."
                  placeholderTextColor="#9ca3af"
                  value={currentLab.notes}
                  onChangeText={(v) => setCurrentLab({ ...currentLab, notes: v })}
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
                <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">Attachments</Text>
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
                  <Text className="text-indigo-600 dark:text-indigo-400 font-medium ml-2">Take Photo</Text>
                </Pressable>
                <Pressable
                  onPress={handlePickImage}
                  className="flex-1 flex-row items-center justify-center border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800 px-3 py-3 rounded-xl"
                >
                  <ImageIcon size={18} color="#6366f1" strokeWidth={1.5} />
                  <Text className="text-indigo-600 dark:text-indigo-400 font-medium ml-2">Gallery</Text>
                </Pressable>
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleConfirmSave}
              className="bg-blue-500 py-4 rounded-xl items-center mt-6 mb-8"
            >
              <Text className="text-white font-semibold">Save Entry</Text>
            </Pressable>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
