import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
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
  TimelineDateBadge,
  TimelineEntryCard,
  DoctorBookletDetailSkeleton,
  type BookletTab,
} from "@/components/ui";
import {
  NotesEditModal,
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

  // Tab state
  const [activeTab, setActiveTab] = useState<BookletTab>("history");

  // Get booklet with mother info
  const booklet = doctorBooklets.find((b) => b.id === bookletId);

  const isLoading =
    currentUser === undefined ||
    doctorBooklets === undefined ||
    entries === undefined ||
    allMedications === undefined;

  // State
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );

  // Get sorted entries by date (most recent first)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = new Date(a.visitDate).getTime();
      const dateB = new Date(b.visitDate).getTime();
      return dateB - dateA;
    });
  }, [entries]);

  // Get today's entry (if exists) for edit mode
  const todayEntry = useMemo(() => {
    const todayStr = getDateString(new Date());
    return (
      entries.find((e) => {
        const dateStr = getDateString(e.visitDate);
        return dateStr === todayStr;
      }) || null
    );
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

  // Get the most recent AOG from entries
  const latestAOG = useMemo(() => {
    for (const entry of sortedEntries) {
      if (entry.vitals?.aog) {
        return entry.vitals.aog;
      }
    }
    return null;
  }, [sortedEntries]);

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
              Alert.alert(
                "Error",
                "Failed to stop medication. Please try again."
              );
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
              entryData.attachments.length > 0
                ? entryData.attachments
                : undefined,
            followUpDate: entryData.followUpDate,
          },
        });
        entryId = todayEntry.id;

        // Delete removed medications
        if (deletedMedicationIds.length > 0) {
          await Promise.all(
            deletedMedicationIds.map((id) => deleteMedication(id))
          );
        }

        // Delete removed labs
        if (deletedLabIds.length > 0) {
          await Promise.all(deletedLabIds.map((id) => deleteLabRequest(id)));
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
            entryData.attachments.length > 0
              ? entryData.attachments
              : undefined,
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
      Alert.alert(
        "Error",
        isEdit
          ? "Failed to update entry. Please try again."
          : "Failed to save entry. Please try again."
      );
      throw error; // Re-throw so the modal knows it failed
    } finally {
      setIsSavingEntry(false);
    }
  };

  // Handle entry card press - navigate to entry detail (future)
  const handleEntryPress = (entryId: string) => {
    // For now, just log it. In future, navigate to entry detail screen
    console.log("Entry pressed:", entryId);
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
      <ScrollView
        className="flex-1 bg-slate-900"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with curved blue background */}
        <View
          className="bg-blue-500 px-5 pb-12 relative overflow-hidden"
          style={{
            paddingTop: insets.top + 8,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          {/* Decorative blur circle */}
          <View
            className="absolute -top-32 -right-16 w-64 h-64 bg-white/5 rounded-full"
            style={{ transform: [{ scale: 1.5 }] }}
          />

          {/* Back Button */}
          <CardPressable
            onPress={() => router.back()}
            className="flex-row items-center mb-6 opacity-90"
          >
            <ChevronLeft size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-white text-sm font-semibold tracking-wide ml-1">
              Back
            </Text>
          </CardPressable>

          {/* Patient Info Row */}
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

            {/* AOG Badge */}
            {latestAOG && <AOGBadge aog={latestAOG} size="md" />}
          </View>

          {/* Status Badges Row */}
          <View className="flex-row items-center gap-3 mt-5">
            <StatusBadge
              status={booklet.status}
              showDot
              glassmorphism
            />
            {booklet.expectedDueDate && (
              <View className="bg-blue-600/30 px-3 py-1 rounded-full border border-white/10">
                <Text className="text-blue-50 text-xs font-medium">
                  Due: {formatDate(booklet.expectedDueDate)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Main Content Area */}
        <View className="px-5 -mt-8 relative z-20 pb-24">
          {/* Tab Bar */}
          <View className="mb-6">
            <BookletTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </View>

          {/* Tab Content */}
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

          {activeTab === "labs" && (
            <LabsTabContent labs={allLabs} bookletId={bookletId} />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => setShowEntryModal(true)}
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
      </Pressable>

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

// ============================================================================
// Tab Content Components
// ============================================================================

interface HistoryTabContentProps {
  entries: Array<{
    id: string;
    entryType: any;
    doctorName: string;
    visitDate: Date | string;
    vitals?: any;
    followUpDate?: Date | string;
    notes?: string;
  }>;
  allMedications: Array<{ medicalEntryId?: string }>;
  onEntryPress: (entryId: string) => void;
}

function HistoryTabContent({
  entries,
  allMedications,
  onEntryPress,
}: HistoryTabContentProps) {
  if (entries.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-slate-600 text-sm">No records yet</Text>
      </View>
    );
  }

  return (
    <View className="relative">
      {/* Vertical Timeline Line */}
      <View
        className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-slate-700/50"
        style={{ zIndex: 0 }}
      />

      {/* Timeline Entries */}
      {entries.map((entry, index) => {
        const isFirst = index === 0;
        const hasMeds = allMedications.some(
          (m) => m.medicalEntryId === entry.id
        );
        const hasNotes = !!entry.notes && entry.notes.trim().length > 0;

        return (
          <View key={entry.id} className="relative pb-8" style={{ zIndex: 10 }}>
            <View className="flex-row items-start gap-4">
              {/* Date Badge */}
              <View className="min-w-[56px]">
                <TimelineDateBadge date={entry.visitDate} isActive={isFirst} />
              </View>

              {/* Entry Card */}
              <TimelineEntryCard
                entryType={entry.entryType}
                doctorName={entry.doctorName}
                visitDate={entry.visitDate}
                vitals={entry.vitals}
                followUpDate={entry.followUpDate}
                hasNotes={hasNotes}
                hasMedications={hasMeds}
                variant={isFirst ? "expanded" : "compact"}
                faded={!isFirst}
                onPress={() => onEntryPress(entry.id)}
              />
            </View>
          </View>
        );
      })}

      {/* End of Records */}
      <View className="items-center mt-2">
        <Text className="text-xs text-slate-600 font-medium bg-slate-900 px-2">
          No more records
        </Text>
      </View>
    </View>
  );
}

interface MedsTabContentProps {
  medications: Medication[];
  activeMeds: Medication[];
  onEditMedication: (med: Medication) => void;
  onStopMedication: (med: Medication) => void;
}

function MedsTabContent({
  medications,
  activeMeds,
  onEditMedication,
  onStopMedication,
}: MedsTabContentProps) {
  const inactiveMeds = medications.filter((m) => !m.isActive);

  if (medications.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-slate-600 text-sm">No medications yet</Text>
        <Text className="text-slate-700 text-xs mt-1">
          Add medications when creating an entry
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Active Medications */}
      {activeMeds.length > 0 && (
        <View className="mb-6">
          <Text className="text-white font-semibold mb-3">
            Active ({activeMeds.length})
          </Text>
          {activeMeds.map((med) => (
            <View
              key={med.id}
              className="bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-white font-semibold">{med.name}</Text>
                  <Text className="text-slate-400 text-sm">{med.dosage}</Text>
                  {med.instructions && (
                    <Text className="text-slate-500 text-xs mt-1">
                      {med.instructions}
                    </Text>
                  )}
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => onEditMedication(med)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700"
                  >
                    <Text className="text-blue-400 text-xs font-medium">
                      Edit
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onStopMedication(med)}
                    className="px-3 py-1.5 rounded-lg bg-red-900/30"
                  >
                    <Text className="text-red-400 text-xs font-medium">
                      Stop
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Inactive Medications */}
      {inactiveMeds.length > 0 && (
        <View>
          <Text className="text-slate-500 font-semibold mb-3">
            Past ({inactiveMeds.length})
          </Text>
          {inactiveMeds.map((med) => (
            <View
              key={med.id}
              className="bg-slate-800/50 rounded-xl p-4 mb-3 border border-slate-700/50 opacity-60"
            >
              <Text className="text-white font-semibold">{med.name}</Text>
              <Text className="text-slate-400 text-sm">{med.dosage}</Text>
              {med.endDate && (
                <Text className="text-slate-500 text-xs mt-1">
                  Ended: {formatDate(med.endDate)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface LabsTabContentProps {
  labs: Array<{
    id: string;
    description: string;
    status: string;
    requestedDate: Date | string;
    completedDate?: Date | string;
    results?: string;
  }>;
  bookletId: string;
}

function LabsTabContent({ labs }: LabsTabContentProps) {
  const pendingLabs = labs.filter((l) => l.status === "pending");
  const completedLabs = labs.filter((l) => l.status === "completed");
  const cancelledLabs = labs.filter((l) => l.status === "cancelled");

  if (labs.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-slate-600 text-sm">No lab requests yet</Text>
        <Text className="text-slate-700 text-xs mt-1">
          Add lab requests when creating an entry
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Pending Labs */}
      {pendingLabs.length > 0 && (
        <View className="mb-6">
          <Text className="text-amber-400 font-semibold mb-3">
            Pending ({pendingLabs.length})
          </Text>
          {pendingLabs.map((lab) => (
            <View
              key={lab.id}
              className="bg-slate-800 rounded-xl p-4 mb-3 border border-amber-500/30"
            >
              <Text className="text-white font-semibold">{lab.description}</Text>
              <Text className="text-slate-400 text-xs mt-1">
                Requested: {formatDate(lab.requestedDate)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Completed Labs */}
      {completedLabs.length > 0 && (
        <View className="mb-6">
          <Text className="text-green-400 font-semibold mb-3">
            Completed ({completedLabs.length})
          </Text>
          {completedLabs.map((lab) => (
            <View
              key={lab.id}
              className="bg-slate-800 rounded-xl p-4 mb-3 border border-green-500/30"
            >
              <Text className="text-white font-semibold">{lab.description}</Text>
              {lab.results && (
                <Text className="text-slate-300 text-sm mt-2">
                  {lab.results}
                </Text>
              )}
              <Text className="text-slate-400 text-xs mt-1">
                Completed: {formatDate(lab.completedDate || lab.requestedDate)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Cancelled Labs */}
      {cancelledLabs.length > 0 && (
        <View>
          <Text className="text-slate-500 font-semibold mb-3">
            Cancelled ({cancelledLabs.length})
          </Text>
          {cancelledLabs.map((lab) => (
            <View
              key={lab.id}
              className="bg-slate-800/50 rounded-xl p-4 mb-3 border border-slate-700/50 opacity-60"
            >
              <Text className="text-white font-semibold">{lab.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
