import { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, Plus, Baby, Pencil, AlertTriangle } from "lucide-react-native";
import { useCurrentUser, useLabAttachmentUrls } from "@/hooks";
import { formatDate, calculateAOG } from "@/utils";
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
  EditMedicationModal,
  EditLMPModal,
  HistoryTabContent,
  MedsTabContent,
  LabsTabContent,
  PatientIdEditor,
} from "@/components/doctor";
import {
  MedicalBackgroundSection,
  AddAllergyModal,
  AddMedicalHistoryModal,
} from "@/components/medical";
import type { Medication, LabRequestWithDoctor, MedicalHistoryItem } from "@/types";
import {
  useBookletByIdWithMother,
  useEntriesByBooklet,
  useLabsByBooklet,
  useMedicationsByBooklet,
  useUpdateBooklet,
  useUpdateMedication,
  useAccessPatientId,
  useUpdatePatientId,
} from "@/hooks";

export default function DoctorBookletDetailScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
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
  const updatePatientId = useUpdatePatientId();

  // Patient ID query
  const patientId = useAccessPatientId(bookletId, doctorProfile?._id);

  // Local state
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingMedication, setIsSavingMedication] = useState(false);
  const [isSavingLMP, setIsSavingLMP] = useState(false);
  const [activeTab, setActiveTab] = useState<BookletTab>("history");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showLMPModal, setShowLMPModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );
  const [pendingLabView, setPendingLabView] = useState<LabRequestWithDoctor | null>(null);
  const [showAddAllergyModal, setShowAddAllergyModal] = useState(false);
  const [showAddMedicalHistoryModal, setShowAddMedicalHistoryModal] = useState(false);
  const [isSavingAllergies, setIsSavingAllergies] = useState(false);

  // Fetch URLs for selected lab (for image viewer navigation)
  const labAttachmentUrls = useLabAttachmentUrls(pendingLabView?.id);
  const hasNavigatedRef = useRef(false);

  // Navigate to image viewer when URLs are loaded
  useEffect(() => {
    if (pendingLabView && labAttachmentUrls && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const urls = labAttachmentUrls
        .map((item: { url: string | null }) => item.url)
        .filter((url: string | null): url is string => url !== null);

      if (urls.length > 0) {
        router.push({
          pathname: "/(doctor)/image-viewer",
          params: {
            urls: JSON.stringify(urls),
            title: pendingLabView.description,
          },
        });
      }
      setPendingLabView(null);
    }
  }, [pendingLabView, labAttachmentUrls, router]);

  // Reset navigation flag when pendingLabView changes
  useEffect(() => {
    if (!pendingLabView) {
      hasNavigatedRef.current = false;
    }
  }, [pendingLabView]);

  const handleViewLabAttachments = (lab: LabRequestWithDoctor) => {
    setPendingLabView(lab);
  };

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

  // Calculate AOG from booklet's LMP
  const currentAOG = useMemo(() => {
    if (!booklet?.lastMenstrualPeriod) return null;
    return calculateAOG(booklet.lastMenstrualPeriod);
  }, [booklet?.lastMenstrualPeriod]);

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

  const handleSaveLMP = async (lmp: Date | null, dueDate: Date | null) => {
    if (!booklet) return;
    setIsSavingLMP(true);
    try {
      await updateBooklet({
        id: booklet.id,
        updates: {
          lastMenstrualPeriod: lmp?.getTime() ?? undefined,
          expectedDueDate: dueDate?.getTime() ?? undefined,
        },
      });
      setShowLMPModal(false);
    } catch {
      Alert.alert("Error", "Failed to update LMP. Please try again.");
    } finally {
      setIsSavingLMP(false);
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

  // Allergy and Medical History handlers
  const handleAddAllergy = async (allergy: string) => {
    if (!booklet) return;
    setIsSavingAllergies(true);
    try {
      const currentAllergies = booklet.allergies || [];
      await updateBooklet({
        id: booklet.id,
        updates: { allergies: [...currentAllergies, allergy] },
      });
    } catch {
      Alert.alert("Error", "Failed to add allergy.");
    } finally {
      setIsSavingAllergies(false);
    }
  };

  const handleRemoveAllergy = async (allergies: string[]) => {
    if (!booklet) return;
    setIsSavingAllergies(true);
    try {
      await updateBooklet({
        id: booklet.id,
        updates: { allergies },
      });
    } catch {
      Alert.alert("Error", "Failed to remove allergy.");
    } finally {
      setIsSavingAllergies(false);
    }
  };

  const handleAddMedicalHistory = async (item: MedicalHistoryItem) => {
    if (!booklet) return;
    setIsSavingAllergies(true);
    try {
      const currentHistory = booklet.medicalHistory || [];
      await updateBooklet({
        id: booklet.id,
        updates: { medicalHistory: [...currentHistory, item] },
      });
    } catch {
      Alert.alert("Error", "Failed to add medical history.");
    } finally {
      setIsSavingAllergies(false);
    }
  };

  const handleRemoveMedicalHistory = async (history: MedicalHistoryItem[]) => {
    if (!booklet) return;
    setIsSavingAllergies(true);
    try {
      await updateBooklet({
        id: booklet.id,
        updates: { medicalHistory: history },
      });
    } catch {
      Alert.alert("Error", "Failed to remove medical history.");
    } finally {
      setIsSavingAllergies(false);
    }
  };

  // Patient ID handler
  const handleSavePatientId = async (newPatientId: string | undefined) => {
    if (!booklet || !doctorProfile) return;
    await updatePatientId({
      bookletId: booklet.id,
      doctorId: doctorProfile._id,
      patientId: newPatientId,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-slate-900"
        showsVerticalScrollIndicator={false}
        bounces={false}
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
              <View className="flex-row items-center gap-3 mt-1">
                <View className="flex-row items-center gap-1.5">
                  <Baby size={14} color="#bfdbfe" strokeWidth={1.5} />
                  <Text className="text-blue-100 font-medium">
                    {booklet.label}
                  </Text>
                </View>
                <PatientIdEditor
                  patientId={patientId ?? undefined}
                  onSave={handleSavePatientId}
                  compact
                />
              </View>
            </View>
            {currentAOG && <AOGBadge aog={currentAOG} size="md" />}
          </View>

          <View className="flex-row items-center gap-3 mt-5 flex-wrap">
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
            <Pressable
              onPress={() => setShowLMPModal(true)}
              className="bg-blue-600/30 px-3 py-1 rounded-full border border-white/10 flex-row items-center gap-1.5"
            >
              <Text className="text-blue-50 text-xs font-medium">
                {booklet.expectedDueDate
                  ? `Due: ${formatDate(booklet.expectedDueDate)}`
                  : "Set LMP"}
              </Text>
              <Pencil size={10} color="#eff6ff" strokeWidth={2} />
            </Pressable>
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
              onViewAttachments={handleViewLabAttachments}
            />
          )}

          {activeTab === "medical" && (
            <View className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
              <MedicalBackgroundSection
                allergies={booklet.allergies}
                medicalHistory={booklet.medicalHistory}
                editable={true}
                onAllergiesChange={handleRemoveAllergy}
                onMedicalHistoryChange={handleRemoveMedicalHistory}
                onAddAllergy={() => setShowAddAllergyModal(true)}
                onAddMedicalHistory={() => setShowAddMedicalHistoryModal(true)}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(doctor)/booklet/add-entry",
            params: { bookletId },
          })
        }
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

      <EditLMPModal
        visible={showLMPModal}
        onClose={() => setShowLMPModal(false)}
        currentLMP={booklet.lastMenstrualPeriod}
        onSave={handleSaveLMP}
        isSaving={isSavingLMP}
      />

      <AddAllergyModal
        visible={showAddAllergyModal}
        onClose={() => setShowAddAllergyModal(false)}
        onAdd={handleAddAllergy}
        existingAllergies={booklet.allergies}
      />

      <AddMedicalHistoryModal
        visible={showAddMedicalHistoryModal}
        onClose={() => setShowAddMedicalHistoryModal(false)}
        onAdd={handleAddMedicalHistory}
        existingConditions={booklet.medicalHistory}
      />
    </SafeAreaView>
  );
}
