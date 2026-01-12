import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, Plus, Baby } from "lucide-react-native";
import { useCurrentUser } from "@/hooks";
import { formatDate, getDateString } from "@/utils";
import {
  CardPressable,
  StatusBadge,
  AOGBadge,
  BookletTabBar,
  DoctorBookletDetailSkeleton,
  type BookletTab,
} from "@/components/ui";
import {
  NotesEditModal,
  AddEntryModal,
  EditMedicationModal,
  HistoryTabContent,
  MedsTabContent,
  LabsTabContent,
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

  // Convex query hooks
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

  // Local state
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingMedication, setIsSavingMedication] = useState(false);
  const [activeTab, setActiveTab] = useState<BookletTab>("history");
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );

  // Get booklet with mother info
  const booklet = doctorBooklets.find((b) => b.id === bookletId);

  const isLoading =
    currentUser === undefined ||
    doctorBooklets === undefined ||
    entries === undefined ||
    allMedications === undefined;

  // Sorted entries by date (most recent first)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = new Date(a.visitDate).getTime();
      const dateB = new Date(b.visitDate).getTime();
      return dateB - dateA;
    });
  }, [entries]);

  // Today's entry for edit mode
  const todayEntry = useMemo(() => {
    const todayStr = getDateString(new Date());
    return entries.find((e) => getDateString(e.visitDate) === todayStr) || null;
  }, [entries]);

  const todayMeds = useMemo(() => {
    if (!todayEntry) return [];
    return allMedications.filter((m) => m.medicalEntryId === todayEntry.id);
  }, [todayEntry, allMedications]);

  const todayEntryLabs = useLabsByEntry(todayEntry?.id) ?? [];

  // Latest AOG from entries
  const latestAOG = useMemo(() => {
    for (const entry of sortedEntries) {
      if (entry.vitals?.aog) return entry.vitals.aog;
    }
    return null;
  }, [sortedEntries]);

  const activeMeds = allMedications.filter((m) => m.isActive);

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

  // Handlers
  const handleSaveNotes = async () => {
    if (!booklet) return;
    setIsSavingNotes(true);
    try {
      await updateBooklet({
        id: booklet.id,
        updates: { notes: editingNotes.trim() || undefined },
      });
      setShowNotesModal(false);
    } catch {
      Alert.alert("Error", "Failed to save notes. Please try again.");
    } finally {
      setIsSavingNotes(false);
    }
  };

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
                updates: { endDate: new Date(), isActive: false },
              });
            } catch {
              Alert.alert("Error", "Failed to stop medication.");
            }
          },
        },
      ]
    );
  };

  const handleUpdateMedication = async (updates: Partial<Medication>) => {
    if (!editingMedication) return;
    setIsSavingMedication(true);
    try {
      await updateMedication({ id: editingMedication.id, updates });
      setEditingMedication(null);
    } catch {
      Alert.alert("Error", "Failed to update medication.");
    } finally {
      setIsSavingMedication(false);
    }
  };

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
              entryData.attachments.length > 0
                ? entryData.attachments
                : undefined,
            followUpDate: entryData.followUpDate,
          },
        });
        entryId = todayEntry.id;

        if (deletedMedicationIds.length > 0) {
          await Promise.all(
            deletedMedicationIds.map((id) => deleteMedication(id))
          );
        }
        if (deletedLabIds.length > 0) {
          await Promise.all(deletedLabIds.map((id) => deleteLabRequest(id)));
        }
      } else {
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
            entryData.attachments.length > 0
              ? entryData.attachments
              : undefined,
          followUpDate: entryData.followUpDate,
        });
        if (!newEntry) throw new Error("Failed to create entry");
        entryId = newEntry.id;
      }

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
              endDate: med.endDate || entryData.followUpDate,
            })
          )
        );
      }

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
    } catch {
      Alert.alert(
        "Error",
        isEdit ? "Failed to update entry." : "Failed to save entry."
      );
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleEntryPress = (entryId: string) => {
    console.log("Entry pressed:", entryId);
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
      <ScrollView
        className="flex-1 bg-slate-900"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          className="bg-blue-500 px-5 pb-12 relative overflow-hidden"
          style={{
            paddingTop: insets.top + 8,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          <View
            className="absolute -top-32 -right-16 w-64 h-64 bg-white/5 rounded-full"
            style={{ transform: [{ scale: 1.5 }] }}
          />

          <CardPressable
            onPress={() => router.back()}
            className="flex-row items-center mb-6 opacity-90"
          >
            <ChevronLeft size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-white text-sm font-semibold tracking-wide ml-1">
              Back
            </Text>
          </CardPressable>

          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white tracking-tight">
                {booklet.motherName}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Baby size={14} color="#bfdbfe" strokeWidth={1.5} />
                <Text className="text-blue-100 font-medium">
                  {booklet.label}
                </Text>
              </View>
            </View>
            {latestAOG && <AOGBadge aog={latestAOG} size="md" />}
          </View>

          <View className="flex-row items-center gap-3 mt-5">
            <StatusBadge status={booklet.status} showDot glassmorphism />
            {booklet.expectedDueDate && (
              <View className="bg-blue-600/30 px-3 py-1 rounded-full border border-white/10">
                <Text className="text-blue-50 text-xs font-medium">
                  Due: {formatDate(booklet.expectedDueDate)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="px-5 -mt-8 relative z-20 pb-24">
          <View className="mb-6">
            <BookletTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </View>

          {activeTab === "history" && (
            <HistoryTabContent
              entries={sortedEntries}
              allMedications={allMedications}
              onEntryPress={handleEntryPress}
            />
          )}

          {activeTab === "meds" && (
            <MedsTabContent
              medications={allMedications}
              activeMeds={activeMeds}
              onEditMedication={setEditingMedication}
              onStopMedication={handleStopMedication}
            />
          )}

          {activeTab === "labs" && <LabsTabContent labs={allLabs} />}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowEntryModal(true)}
        activeOpacity={0.8}
        className="absolute bottom-24 right-5 bg-blue-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        style={{
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={28} color="#ffffff" strokeWidth={2} />
      </TouchableOpacity>

      {/* Modals */}
      <AddEntryModal
        visible={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSave={handleSaveEntry}
        isSaving={isSavingEntry}
        existingEntry={todayEntry}
        existingMedications={todayMeds}
        existingLabs={todayEntryLabs}
      />

      <NotesEditModal
        visible={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        notes={editingNotes}
        onNotesChange={setEditingNotes}
        onSave={handleSaveNotes}
        isSaving={isSavingNotes}
      />

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
