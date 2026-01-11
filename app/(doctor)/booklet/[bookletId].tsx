import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, Plus, FileText, Pill, Edit2, StopCircle } from "lucide-react-native";
import { useCurrentUser } from "@/hooks";
import { formatDate } from "@/utils";
import {
  CardPressable,
  StatCard,
  AnimatedCollapsible,
  CollapsibleSectionHeader,
  DoctorBookletDetailSkeleton,
} from "@/components/ui";
import { MedicationCard } from "@/components";
import {
  NotesEditModal,
  EntryCard,
  AddEntryModal,
  EditMedicationModal,
  type EntryFormData,
  type MedicationData,
  type LabData,
} from "@/components/doctor";
import type { Medication } from "@/types";
import {
  useBookletsByDoctor,
  useEntriesByBooklet,
  useLabsByEntry,
  useLabsByBooklet,
  useMedicationsByBooklet,
  useCreateEntry,
  useCreateMedication,
  useCreateLabRequest,
  useUpdateBooklet,
  useUpdateMedication,
  useUpdateEntry,
  useDeleteMedication,
  useDeleteLabRequest,
} from "@/hooks";

export default function DoctorBookletDetailScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentUser = useCurrentUser();
  const doctorProfile = currentUser?.doctorProfile;

  // Convex query hooks for data fetching
  const doctorBooklets = useBookletsByDoctor(doctorProfile?._id) ?? [];
  const entries = useEntriesByBooklet(bookletId) ?? [];
  const allMedications = useMedicationsByBooklet(bookletId) ?? [];
  const allLabs = useLabsByBooklet(bookletId) ?? [];

  // Mutation hooks
  const createEntry = useCreateEntry();
  const createMedication = useCreateMedication();
  const createLabRequest = useCreateLabRequest();
  const updateBooklet = useUpdateBooklet();
  const updateMedication = useUpdateMedication();
  const updateEntry = useUpdateEntry();
  const deleteMedication = useDeleteMedication();
  const deleteLabRequest = useDeleteLabRequest();

  // Local loading states for mutations
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingMedication, setIsSavingMedication] = useState(false);

  // Get booklet with mother info
  const booklet = doctorBooklets.find((b) => b.id === bookletId);

  const isLoading =
    currentUser === undefined ||
    doctorBooklets === undefined ||
    entries === undefined ||
    allMedications === undefined;

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [activeMedsExpanded, setActiveMedsExpanded] = useState(true);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  // Set selected date to most recent when entries load
  useEffect(() => {
    if (visitDates.length > 0 && selectedDate === null) {
      setSelectedDate(visitDates[0]);
    }
  }, [visitDates, selectedDate]);

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
  const selectedEntryLabs = useLabsByEntry(selectedEntry?.id) ?? [];

  // Get today's entry (if exists) for edit mode
  const todayEntry = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return entries.find((e) => {
      const d = e.visitDate;
      const dateStr = typeof d === "string" ? d : new Date(d).toISOString().split("T")[0];
      return dateStr === todayStr;
    }) || null;
  }, [entries]);

  // Get medications for today's entry
  const todayMeds = useMemo(() => {
    if (!todayEntry) return [];
    return allMedications.filter((m) => m.medicalEntryId === todayEntry.id);
  }, [todayEntry, allMedications]);

  // Fetch labs for today's entry (for edit mode)
  const todayEntryLabs = useLabsByEntry(todayEntry?.id) ?? [];

  // Loading state
  if (isLoading) {
    return <DoctorBookletDetailSkeleton />;
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

  // Open notes editing modal
  const handleOpenNotesModal = () => {
    setEditingNotes(booklet?.notes || "");
    setShowNotesModal(true);
  };

  // Save booklet notes
  const handleSaveNotes = async () => {
    if (!booklet) return;
    setIsSavingNotes(true);
    try {
      await updateBooklet({
        id: booklet.id,
        updates: { notes: editingNotes.trim() || undefined },
      });
      setShowNotesModal(false);
    } catch (_error) {
      Alert.alert("Error", "Failed to save notes. Please try again.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Stop medication (set endDate to today and isActive to false)
  const handleStopMedication = async (medication: Medication) => {
    Alert.alert(
      "Stop Medication",
      `Are you sure you want to stop ${medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: async () => {
            try {
              await updateMedication({
                id: medication.id,
                updates: {
                  endDate: new Date(),
                  isActive: false,
                },
              });
            } catch (_error) {
              Alert.alert("Error", "Failed to stop medication. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Update medication
  const handleUpdateMedication = async (updates: Partial<Medication>) => {
    if (!editingMedication) return;
    setIsSavingMedication(true);
    try {
      await updateMedication({
        id: editingMedication.id,
        updates,
      });
      setEditingMedication(null);
    } catch (_error) {
      Alert.alert("Error", "Failed to update medication. Please try again.");
    } finally {
      setIsSavingMedication(false);
    }
  };

  // Save entry with medications and labs
  const handleSaveEntry = async (
    entryData: EntryFormData,
    medications: MedicationData[],
    labs: LabData[],
    isEdit: boolean,
    deletedMedicationIds: string[],
    deletedLabIds: string[]
  ) => {
    setIsSavingEntry(true);
    try {
      let entryId: string;

      if (isEdit && todayEntry) {
        // UPDATE existing entry
        await updateEntry({
          id: todayEntry.id,
          updates: {
            entryType: entryData.entryType,
            notes: entryData.notes,
            diagnosis: entryData.diagnosis || undefined,
            recommendations: entryData.recommendations || undefined,
            vitals:
              Object.keys(entryData.vitals).length > 0
                ? entryData.vitals
                : undefined,
            attachments:
              entryData.attachments.length > 0 ? entryData.attachments : undefined,
            followUpDate: entryData.followUpDate,
          },
        });
        entryId = todayEntry.id;

        // Delete removed medications
        if (deletedMedicationIds.length > 0) {
          await Promise.all(
            deletedMedicationIds.map((id) =>
              deleteMedication(id)
            )
          );
        }

        // Delete removed labs
        if (deletedLabIds.length > 0) {
          await Promise.all(
            deletedLabIds.map((id) =>
              deleteLabRequest(id)
            )
          );
        }
      } else {
        // CREATE new entry
        const newEntry = await createEntry({
          bookletId,
          doctorId: doctorProfile._id,
          entryType: entryData.entryType,
          visitDate: new Date(),
          notes: entryData.notes,
          diagnosis: entryData.diagnosis || undefined,
          recommendations: entryData.recommendations || undefined,
          vitals:
            Object.keys(entryData.vitals).length > 0
              ? entryData.vitals
              : undefined,
          attachments:
            entryData.attachments.length > 0 ? entryData.attachments : undefined,
          followUpDate: entryData.followUpDate,
        });
        if (!newEntry) {
          throw new Error("Failed to create entry");
        }
        entryId = newEntry.id;
      }

      // Create all NEW medications linked to this entry
      if (medications.length > 0) {
        await Promise.all(
          medications.map((med) =>
            createMedication({
              bookletId,
              medicalEntryId: entryId,
              name: med.name,
              dosage: med.dosage,
              instructions: med.instructions,
              startDate: new Date(),
              frequencyPerDay: med.frequencyPerDay,
              isActive: true,
              // Use medication's endDate or default to follow-up date
              endDate: med.endDate || entryData.followUpDate,
            })
          )
        );
      }

      // Create all NEW lab requests linked to this entry
      if (labs.length > 0) {
        await Promise.all(
          labs.map((lab) =>
            createLabRequest({
              bookletId,
              medicalEntryId: entryId,
              description: lab.description,
              status: "pending",
              requestedDate: new Date(),
              notes: lab.notes || undefined,
            })
          )
        );
      }

      setShowEntryModal(false);
    } catch (error) {
      Alert.alert("Error", isEdit ? "Failed to update entry. Please try again." : "Failed to save entry. Please try again.");
      throw error; // Re-throw so the modal knows it failed
    } finally {
      setIsSavingEntry(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View
          className="bg-blue-500 px-6 py-6"
          style={{ paddingTop: insets.top }}
        >
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

        {/* Quick Stats - tappable to navigate to history */}
        <View className="flex-row px-4 -mt-4">
          <StatCard
            value={entries.length}
            label="Visits"
            color="blue"
            size="sm"
          />
          <StatCard
            value={allMedications.length}
            label="Medications"
            color="green"
            size="sm"
            onPress={() => router.push(`/(doctor)/booklet/${bookletId}/history`)}
          />
          <StatCard
            value={allLabs.length}
            label="Labs"
            color="purple"
            size="sm"
            onPress={() => router.push(`/(doctor)/booklet/${bookletId}/labs`)}
          />
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

        {/* Doctor Notes Section */}
        <View className="px-6 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <FileText size={18} color="#6b7280" strokeWidth={1.5} />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                Doctor Notes
              </Text>
            </View>
            <Pressable
              onPress={handleOpenNotesModal}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <Text className="text-blue-500 text-sm font-medium">Edit</Text>
            </Pressable>
          </View>
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            {booklet.notes ? (
              <Text className="text-gray-600 dark:text-gray-300 text-sm">
                {booklet.notes}
              </Text>
            ) : (
              <Text className="text-gray-400 text-sm italic">
                No notes yet. Tap Edit to add notes about this patient.
              </Text>
            )}
          </View>
        </View>

        {/* Active Medications Section */}
        <View className="px-6 mt-6">
          <View className="mb-3">
            <CollapsibleSectionHeader
              title="Active Medications"
              count={activeMeds.length}
              expanded={activeMedsExpanded}
              onToggle={() => setActiveMedsExpanded(!activeMedsExpanded)}
              icon={Pill}
              size="md"
            />
          </View>
          <AnimatedCollapsible expanded={activeMedsExpanded}>
            {activeMeds.length === 0 ? (
              <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <Text className="text-gray-400 text-center">No active medications</Text>
                <Text className="text-gray-300 dark:text-gray-500 text-sm text-center mt-1">
                  Add medications when creating an entry
                </Text>
              </View>
            ) : (
              <View>
                {activeMeds.map((med) => (
                  <View key={med.id} className="mb-3">
                    <MedicationCard
                      medication={med}
                      headerAction={
                        <View className="flex-row">
                          <Pressable
                            onPress={() => setEditingMedication(med)}
                            className="p-2 mr-1 rounded-lg bg-gray-100 dark:bg-gray-700"
                          >
                            <Edit2 size={16} color="#3b82f6" strokeWidth={1.5} />
                          </Pressable>
                          <Pressable
                            onPress={() => handleStopMedication(med)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30"
                          >
                            <StopCircle size={16} color="#ef4444" strokeWidth={1.5} />
                          </Pressable>
                        </View>
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </AnimatedCollapsible>
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
                          isSelected
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-200"
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
                <EntryCard
                  entry={selectedEntry}
                  medications={getMedsForEntry(selectedEntry.id)}
                  labs={selectedEntryLabs}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Entry Modal */}
      <AddEntryModal
        visible={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSave={handleSaveEntry}
        isSaving={isSavingEntry}
        existingEntry={todayEntry}
        existingMedications={todayMeds}
        existingLabs={todayEntryLabs}
      />

      {/* Notes Editing Modal */}
      <NotesEditModal
        visible={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        notes={editingNotes}
        onNotesChange={setEditingNotes}
        onSave={handleSaveNotes}
        isSaving={isSavingNotes}
      />

      {/* Edit Medication Modal */}
      <EditMedicationModal
        visible={!!editingMedication}
        medication={editingMedication}
        onClose={() => setEditingMedication(null)}
        onSave={handleUpdateMedication}
        isSaving={isSavingMedication}
      />
    </SafeAreaView>
  );
}
