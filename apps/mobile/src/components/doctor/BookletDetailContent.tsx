/**
 * Booklet Detail Content Component
 *
 * Reusable content for displaying booklet details.
 * Can be used standalone (with back button) or embedded in master-detail view.
 */

import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Plus, Baby, Users, AlertTriangle } from "lucide-react-native";
import { useCurrentUser } from "@/hooks";
import { formatDate } from "@/utils";
import {
  CardPressable,
  StatusBadge,
  AOGBadge,
  BookletTabBar,
  DoctorBookletDetailSkeleton,
  EmptyState,
  type BookletTab,
} from "@/components/ui";
import {
  NotesEditModal,
  EditMedicationModal,
  HistoryTabContent,
  MedsTabContent,
  LabsTabContent,
} from "@/components/doctor";
import { LabAttachmentViewer } from "@/components/shared";
import type { Medication, LabRequestWithDoctor } from "@/types";
import {
  useBookletByIdWithMother,
  useEntriesByBooklet,
  useLabsByBooklet,
  useMedicationsByBooklet,
  useUpdateBooklet,
  useUpdateMedication,
} from "@/hooks";

interface BookletDetailContentProps {
  /** The booklet ID to display */
  bookletId: string;
  /** When true, hides back button and adjusts styling for embedded view */
  embedded?: boolean;
}

export function BookletDetailContent({
  bookletId,
  embedded = false,
}: BookletDetailContentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentUser = useCurrentUser();
  const doctorProfile = currentUser?.doctorProfile;

  // Convex query hooks
  const booklet = useBookletByIdWithMother(bookletId);
  const entries = useEntriesByBooklet(bookletId) ?? [];
  const allMedications = useMedicationsByBooklet(bookletId) ?? [];
  const allLabs = useLabsByBooklet(bookletId) ?? [];

  // Mutation hooks
  const updateBooklet = useUpdateBooklet();
  const updateMedication = useUpdateMedication();

  // Local state
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingMedication, setIsSavingMedication] = useState(false);
  const [activeTab, setActiveTab] = useState<BookletTab>("history");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );
  const [viewingLabAttachments, setViewingLabAttachments] =
    useState<LabRequestWithDoctor | null>(null);

  const isLoading =
    currentUser === undefined ||
    booklet === undefined ||
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
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <EmptyState
          icon={Users}
          title="Booklet not found"
          description="Select a patient from the list"
        />
      </View>
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

  // Adjust top padding based on embedded mode
  const topPadding = embedded ? 16 : insets.top + 8;

  return (
    <View className="flex-1 bg-blue-500">
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-slate-900"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          className="bg-blue-500 px-5 pb-12 relative overflow-hidden"
          style={{
            paddingTop: topPadding,
            borderBottomLeftRadius: embedded ? 24 : 40,
            borderBottomRightRadius: embedded ? 24 : 40,
          }}
        >
          <View
            className="absolute -top-32 -right-16 w-64 h-64 bg-white/5 rounded-full"
            style={{ transform: [{ scale: 1.5 }] }}
          />

          {/* Back button - only shown when not embedded */}
          {!embedded && (
            <CardPressable
              onPress={() => router.back()}
              className="flex-row items-center mb-6 opacity-90"
            >
              <ChevronLeft size={20} color="#ffffff" strokeWidth={2} />
              <Text className="text-white text-sm font-semibold tracking-wide ml-1">
                Back
              </Text>
            </CardPressable>
          )}

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
            {/* Risk Level Badge */}
            {booklet.currentRiskLevel && (
              <View
                className={`flex-row items-center px-3 py-1 rounded-full ${
                  booklet.currentRiskLevel === "high"
                    ? "bg-red-500/20 border border-red-400/30"
                    : "bg-emerald-500/20 border border-emerald-400/30"
                }`}
              >
                {booklet.currentRiskLevel === "high" && (
                  <AlertTriangle size={12} color="#fca5a5" strokeWidth={2.5} style={{ marginRight: 4 }} />
                )}
                <Text
                  className={`text-xs font-bold ${
                    booklet.currentRiskLevel === "high"
                      ? "text-red-200"
                      : "text-emerald-200"
                  }`}
                >
                  {booklet.currentRiskLevel === "high" ? "High Risk" : "Low Risk"}
                </Text>
              </View>
            )}
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
            <BookletTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </View>

          {activeTab === "history" && (
            <HistoryTabContent
              entries={sortedEntries}
              allMedications={allMedications}
              bookletId={bookletId}
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
            <LabsTabContent
              labs={allLabs}
              onViewAttachments={setViewingLabAttachments}
            />
          )}
        </View>
      </ScrollView>

      {/* FAB - adjust position for embedded view */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(doctor)/booklet/add-entry",
            params: { bookletId },
          })
        }
        activeOpacity={0.8}
        className="absolute bg-blue-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        style={{
          bottom: embedded ? 24 : 96,
          right: 20,
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

      <LabAttachmentViewer
        visible={!!viewingLabAttachments}
        onClose={() => setViewingLabAttachments(null)}
        lab={viewingLabAttachments}
      />
    </View>
  );
}
