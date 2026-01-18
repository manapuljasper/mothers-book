import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  useColorScheme,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Heart,
  Scale,
  Baby,
  Calendar,
  Check,
  CalendarDays,
  CalendarClock,
  X,
  Pill,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  Stethoscope,
} from "lucide-react-native";
import {
  useCurrentUser,
  useBookletByIdWithMother,
  useEntriesByBooklet,
  useCreateEntryWithItems,
  useUpdateEntry,
  useUpdateEntryWithItems,
  useIncrementUsageByName,
  useMedicationsByEntry,
  useLabsByEntry,
  useClinicsByDoctor,
  usePrimaryClinic,
  useAccessPatientId,
  useActiveMedications,
} from "@/hooks";
import {
  computeAOG,
  formatDate,
  getDateString,
  generateId,
  calculateAge,
} from "@/utils";
import {
  VitalInput,
  LoadingScreen,
  AnimatedCollapsible,
} from "@/components/ui";
import {
  MedicationForm,
  hasUnfinishedMedicationForm,
} from "@/components/doctor/MedicationForm";
import {
  LabRequestForm,
  hasUnfinishedLabForm,
} from "@/components/doctor/LabRequestForm";
import { SOAPSectionWrapper } from "@/components/doctor/SOAPSectionWrapper";
import { ClinicSelector } from "@/components/doctor/ClinicSelector";
import { ActiveMedicationsManager } from "@/components/doctor/ActiveMedicationsManager";
import { AllergyWarningBanner } from "@/components/medical";
import { Id } from "@convex/_generated/dataModel";
import type {
  MedicalEntryWithDoctor,
  PendingMedication,
  PendingLabRequest,
  MedicationWithLogs,
} from "@/types";

export default function AddEntryScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const styles = createStyles(colors);

  // Data hooks
  const currentUser = useCurrentUser();
  const doctorProfile = currentUser?.doctorProfile;
  const booklet = useBookletByIdWithMother(bookletId);
  const entries = useEntriesByBooklet(bookletId);

  // Clinic hooks
  const clinics = useClinicsByDoctor(doctorProfile?._id);
  const primaryClinic = usePrimaryClinic(doctorProfile?._id);

  // Patient ID query
  const patientId = useAccessPatientId(bookletId, doctorProfile?._id);

  // Mutations
  const createEntryWithItems = useCreateEntryWithItems();
  const updateEntry = useUpdateEntry();
  const updateEntryWithItems = useUpdateEntryWithItems();
  const incrementUsage = useIncrementUsageByName();

  // Clinic selection state
  const [selectedClinicId, setSelectedClinicId] =
    useState<Id<"doctorClinics"> | null>(null);

  // Initialize clinic from primary clinic
  useEffect(() => {
    if (primaryClinic && !selectedClinicId) {
      setSelectedClinicId(primaryClinic._id);
    }
  }, [primaryClinic, selectedClinicId]);

  // Form state
  const [entryDate, setEntryDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bpValue, setBpValue] = useState("");
  const [weight, setWeight] = useState("");
  const [fhr, setFhr] = useState("");
  const [notes, setNotes] = useState(""); // Subjective - Chief Complaint/History
  const [diagnosis, setDiagnosis] = useState(""); // Assessment - Diagnosis
  const [instructions, setInstructions] = useState(""); // Plan - Recommendations
  const [riskLevel, setRiskLevel] = useState<"low" | "high">("low");
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [tempFollowUpDate, setTempFollowUpDate] = useState(new Date());
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAllergyDetails, setShowAllergyDetails] = useState(false);

  // Medications and Lab Requests state
  const [pendingMedications, setPendingMedications] = useState<
    PendingMedication[]
  >([]);
  const [pendingLabRequests, setPendingLabRequests] = useState<
    PendingLabRequest[]
  >([]);
  const [medicationsExpanded, setMedicationsExpanded] = useState(false);
  const [labsExpanded, setLabsExpanded] = useState(false);

  // Track the entry being edited (if any)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [existingItemsLoaded, setExistingItemsLoaded] = useState(false);

  // Fetch existing medications and labs when editing
  const existingMedications = useMedicationsByEntry(
    editingEntryId ?? undefined
  );
  const existingLabRequests = useLabsByEntry(editingEntryId ?? undefined);

  // Fetch active medications for the booklet (to prevent duplicates in MedicationForm)
  const activeMedications = useActiveMedications(bookletId);

  // Filter active medications to exclude those from the entry being edited
  const filteredActiveMedications = useMemo(() => {
    if (!activeMedications) return undefined;
    if (!editingEntryId) return activeMedications;
    return activeMedications.filter((m: MedicationWithLogs) => m.medicalEntryId !== editingEntryId);
  }, [activeMedications, editingEntryId]);

  // Populate pending medications when editing
  useEffect(() => {
    if (
      editingEntryId &&
      existingMedications &&
      existingMedications.length > 0 &&
      !existingItemsLoaded
    ) {
      // Parse dosage string "400 mg" -> amount="400", unit="mg"
      const pendingFromExisting = existingMedications.map((med) => {
        const dosageParts = med.dosage?.match(/^(\d+\.?\d*)\s*(.*)$/) || [];
        return {
          id: generateId(),
          name: med.name,
          dosageAmount: dosageParts[1] || "",
          dosageUnit: dosageParts[2] || "mg",
          instructions: med.instructions || "",
          frequencyPerDay: med.frequencyPerDay,
          endDate: med.endDate,
          isExisting: true,
          existingId: med.id,
        };
      });
      setPendingMedications(pendingFromExisting);
      setExistingItemsLoaded(true);
    }
  }, [editingEntryId, existingMedications, existingItemsLoaded]);

  // Populate pending labs when editing
  useEffect(() => {
    if (
      editingEntryId &&
      existingLabRequests &&
      existingLabRequests.length > 0 &&
      !existingItemsLoaded
    ) {
      const pendingFromExisting = existingLabRequests.map((lab) => ({
        id: generateId(),
        name: lab.description, // Labs use 'description' as name
        notes: lab.notes || "",
        priority: lab.priority || "routine",
        dueDate: lab.dueDate,
        isExisting: true,
        existingId: lab.id,
      }));
      setPendingLabRequests(pendingFromExisting);
    }
  }, [editingEntryId, existingLabRequests, existingItemsLoaded]);

  const isLoading =
    currentUser === undefined || booklet === undefined || entries === undefined;

  // Find entry by date
  const findEntryByDate = (date: Date): MedicalEntryWithDoctor | null => {
    if (!entries) return null;
    const dateStr = getDateString(date);
    return entries.find((e) => getDateString(e.visitDate) === dateStr) || null;
  };

  // Check if current date has an existing entry
  const isEdit = editingEntryId !== null;

  // Computed AOG based on today's date (includes weeks and days, e.g., "8w 6d")
  const aogDisplay = booklet?.expectedDueDate
    ? computeAOG(booklet.expectedDueDate, new Date())
    : null;

  // Patient info for context bar
  const patientInfo = booklet
    ? {
        name: booklet.motherName,
        status: booklet.status,
        age: booklet.motherBirthdate
          ? calculateAge(booklet.motherBirthdate)
          : null,
        patientId: patientId ?? undefined,
      }
    : null;

  // Prepare clinic list for selector
  const clinicList = useMemo(() => {
    if (!clinics) return [];
    return clinics.map((c) => ({
      id: c._id,
      name: c.name,
      isPrimary: c.isPrimary,
    }));
  }, [clinics]);

  // Check if form has unsaved data
  const hasUnsavedChanges = () => {
    return (
      notes !== "" ||
      diagnosis !== "" ||
      instructions !== "" ||
      bpValue !== "" ||
      weight !== "" ||
      fhr !== "" ||
      followUpDate !== null ||
      pendingMedications.length > 0 ||
      pendingLabRequests.length > 0
    );
  };

  // Medication handlers
  const handleAddMedication = (med: Omit<PendingMedication, "id">) => {
    const newMed: PendingMedication = {
      ...med,
      id: generateId(),
    };
    setPendingMedications((prev) => [...prev, newMed]);
  };

  const handleRemoveMedication = (id: string) => {
    setPendingMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMedication = (
    id: string,
    updates: Partial<PendingMedication>
  ) => {
    setPendingMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  // Lab request handlers
  const handleAddLabRequest = (lab: Omit<PendingLabRequest, "id">) => {
    const newLab: PendingLabRequest = {
      ...lab,
      id: generateId(),
    };
    setPendingLabRequests((prev) => [...prev, newLab]);
  };

  const handleRemoveLabRequest = (id: string) => {
    setPendingLabRequests((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLab = (id: string, updates: Partial<PendingLabRequest>) => {
    setPendingLabRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  // Prefill form with entry data
  const prefillForm = (entry: MedicalEntryWithDoctor) => {
    setBpValue(entry.vitals?.bloodPressure || "");
    setWeight(entry.vitals?.weight?.toString() || "");
    setFhr(entry.vitals?.fetalHeartRate?.toString() || "");
    setNotes(entry.notes || "");
    setDiagnosis(entry.diagnosis || "");
    setInstructions(entry.recommendations || "");
    setRiskLevel(entry.riskLevel || "low");
    setFollowUpDate(entry.followUpDate ? new Date(entry.followUpDate) : null);
    setEditingEntryId(entry.id);
    // Set clinic from the entry (if it has one)
    if (entry.clinicId) {
      setSelectedClinicId(entry.clinicId as Id<"doctorClinics">);
    }
  };

  // Clear form
  const clearForm = () => {
    setBpValue("");
    setWeight("");
    setFhr("");
    setNotes("");
    setDiagnosis("");
    setInstructions("");
    setRiskLevel("low");
    setFollowUpDate(null);
    setEditingEntryId(null);
    setExistingItemsLoaded(false);
    setPendingMedications([]);
    setPendingLabRequests([]);
    // Reset clinic to primary
    if (primaryClinic) {
      setSelectedClinicId(primaryClinic._id);
    }
  };

  // Handle date picker open
  const handleOpenDatePicker = () => {
    setTempDate(entryDate);
    setShowDatePicker(true);
  };

  // Handle date change in picker (temp only)
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      // Android dismisses picker on selection
      setShowDatePicker(false);
      if (selectedDate) {
        confirmDateChange(selectedDate);
      }
    } else if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  // Confirm date change (iOS Done button or Android selection)
  const confirmDateChange = (date: Date) => {
    setShowDatePicker(false);
    setEntryDate(date);

    // Check for existing entry on this date
    const existingEntry = findEntryByDate(date);
    if (existingEntry) {
      prefillForm(existingEntry);
    } else {
      clearForm();
    }
  };

  // Handle iOS Done button
  const handleDatePickerDone = () => {
    confirmDateChange(tempDate);
  };

  // Follow-up date picker handlers
  const handleOpenFollowUpPicker = () => {
    setTempFollowUpDate(followUpDate || new Date());
    setShowFollowUpPicker(true);
  };

  const handleFollowUpDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowFollowUpPicker(false);
      if (selectedDate) {
        setFollowUpDate(selectedDate);
      }
    } else if (selectedDate) {
      setTempFollowUpDate(selectedDate);
    }
  };

  const handleFollowUpPickerDone = () => {
    setShowFollowUpPicker(false);
    setFollowUpDate(tempFollowUpDate);
  };

  const clearFollowUpDate = () => {
    setFollowUpDate(null);
    setShowFollowUpPicker(false);
  };

  // Handle modal close with confirmation
  const handleClose = () => {
    if (hasUnsavedChanges() && !isEdit) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Build and save entry data
  const handleSave = async () => {
    if (!doctorProfile || !bookletId) return;

    setIsSaving(true);
    try {
      const entryVitals: {
        bloodPressure?: string;
        weight?: number;
        fetalHeartRate?: number;
        aog?: string;
      } = {};

      if (bpValue) entryVitals.bloodPressure = bpValue;
      if (weight) entryVitals.weight = parseFloat(weight);
      if (fhr) entryVitals.fetalHeartRate = parseInt(fhr);
      if (aogDisplay) entryVitals.aog = aogDisplay;

      if (isEdit && editingEntryId) {
        // Update existing entry with medications and labs
        // Find new items (without isExisting flag) and removed items
        const newMeds = pendingMedications.filter((m) => !m.isExisting);
        const newLabs = pendingLabRequests.filter((l) => !l.isExisting);

        // Find removed medication IDs (were in existingMedications but not in current pending list)
        const currentExistingMedIds = pendingMedications
          .filter((m) => m.isExisting && m.existingId)
          .map((m) => m.existingId!);
        const removedMedIds = (existingMedications || [])
          .filter((m) => !currentExistingMedIds.includes(m.id))
          .map((m) => m.id);

        // Find removed lab IDs
        const currentExistingLabIds = pendingLabRequests
          .filter((l) => l.isExisting && l.existingId)
          .map((l) => l.existingId!);
        const removedLabIds = (existingLabRequests || [])
          .filter((l) => !currentExistingLabIds.includes(l.id))
          .map((l) => l.id);

        await updateEntryWithItems({
          entryId: editingEntryId,
          clinicId: selectedClinicId ?? undefined,
          entryType: "prenatal_checkup",
          notes,
          diagnosis: diagnosis || undefined,
          recommendations: instructions || undefined,
          riskLevel,
          vitals: Object.keys(entryVitals).length > 0 ? entryVitals : undefined,
          followUpDate: followUpDate ? followUpDate.getTime() : undefined,
          newMedications: newMeds.length > 0 ? newMeds : undefined,
          newLabRequests: newLabs.length > 0 ? newLabs : undefined,
          removeMedicationIds:
            removedMedIds.length > 0 ? removedMedIds : undefined,
          removeLabRequestIds:
            removedLabIds.length > 0 ? removedLabIds : undefined,
        });

        // Track usage for new items
        for (const med of newMeds) {
          incrementUsage({
            doctorId: doctorProfile._id,
            itemType: "medication",
            name: med.name,
            defaultDosage: parseFloat(med.dosageAmount) || undefined,
            defaultDosageUnit: med.dosageUnit,
            defaultFrequency: med.frequencyPerDay,
            defaultInstructions: med.instructions || undefined,
          }).catch(() => {});
        }

        for (const lab of newLabs) {
          incrementUsage({
            doctorId: doctorProfile._id,
            itemType: "lab",
            name: lab.name,
            defaultPriority: lab.priority,
          }).catch(() => {});
        }
      } else {
        // Create new entry with medications and labs
        await createEntryWithItems({
          bookletId,
          doctorId: doctorProfile._id,
          clinicId: selectedClinicId ?? undefined,
          entryType: "prenatal_checkup",
          visitDate: entryDate,
          notes,
          diagnosis: diagnosis || undefined,
          recommendations: instructions || undefined,
          riskLevel,
          vitals: Object.keys(entryVitals).length > 0 ? entryVitals : undefined,
          followUpDate: followUpDate ? followUpDate.getTime() : undefined,
          medications:
            pendingMedications.length > 0 ? pendingMedications : undefined,
          labRequests:
            pendingLabRequests.length > 0 ? pendingLabRequests : undefined,
        });

        // Track usage for favorites (async, don't block)
        for (const med of pendingMedications) {
          incrementUsage({
            doctorId: doctorProfile._id,
            itemType: "medication",
            name: med.name,
            defaultDosage: parseFloat(med.dosageAmount) || undefined,
            defaultDosageUnit: med.dosageUnit,
            defaultFrequency: med.frequencyPerDay,
            defaultInstructions: med.instructions || undefined,
          }).catch(() => {}); // Ignore errors
        }

        for (const lab of pendingLabRequests) {
          incrementUsage({
            doctorId: doctorProfile._id,
            itemType: "lab",
            name: lab.name,
            defaultPriority: lab.priority,
          }).catch(() => {}); // Ignore errors
        }
      }

      router.back();
    } catch {
      Alert.alert(
        "Error",
        isEdit ? "Failed to update entry." : "Failed to save entry."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize form on mount - check if today has an existing entry
  useMemo(() => {
    if (entries && entries.length > 0) {
      const todayEntry = findEntryByDate(new Date());
      if (todayEntry) {
        prefillForm(todayEntry);
      }
    }
  }, [entries]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!booklet || !doctorProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booklet not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Entry" : "New Entry"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Patient Context Bar */}
      {patientInfo && (
        <View style={styles.patientBar}>
          <View style={styles.patientAvatar}>
            <Text style={styles.patientAvatarText}>
              {patientInfo.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.patientInfo}>
            <View style={styles.patientNameRow}>
              <Text style={styles.patientName}>
                {patientInfo.name}
                {patientInfo.age !== null && (
                  <Text style={styles.patientAge}>, {patientInfo.age} y/o</Text>
                )}
              </Text>
              {patientInfo.patientId && (
                <View style={styles.patientIdBadge}>
                  <Text style={styles.patientIdText}>
                    #{patientInfo.patientId}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              patientInfo.status === "active"
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            {patientInfo.status === "active" && (
              <Check size={12} color="#10b981" strokeWidth={2} />
            )}
            <Text
              style={[
                styles.statusText,
                patientInfo.status === "active"
                  ? styles.statusTextActive
                  : styles.statusTextInactive,
              ]}
            >
              {patientInfo.status.charAt(0).toUpperCase() +
                patientInfo.status.slice(1)}
            </Text>
          </View>
        </View>
      )}

      {/* Clinic Selector */}
      {clinicList.length > 0 && (
        <ClinicSelector
          clinics={clinicList}
          selectedClinicId={selectedClinicId}
          onSelectClinic={setSelectedClinicId}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Allergy Warning Banner */}
        {booklet?.allergies && booklet.allergies.length > 0 && (
          <AllergyWarningBanner
            allergies={booklet.allergies}
            expanded={showAllergyDetails}
            onPress={() => setShowAllergyDetails(!showAllergyDetails)}
          />
        )}

        {/* Entry Date Section */}
        <Text style={styles.sectionLabel}>ENTRY DATE</Text>
        {__DEV__ ? (
          // Dev mode: Allow date selection for testing
          <>
            <TouchableOpacity
              onPress={handleOpenDatePicker}
              style={styles.datePickerButton}
              activeOpacity={0.7}
            >
              <CalendarDays size={20} color="#3b82f6" strokeWidth={1.5} />
              <Text style={styles.datePickerText}>
                {formatDate(entryDate, "long")}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                  themeVariant="dark"
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    onPress={handleDatePickerDone}
                    style={styles.datePickerDoneButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        ) : (
          // Production: Read-only date display (plain text)
          <Text style={styles.readOnlyDateText}>
            {formatDate(entryDate, "long")}
          </Text>
        )}

        {/* ===== S - SUBJECTIVE ===== */}
        <View style={{ marginTop: 24 }}>
          <SOAPSectionWrapper section="subjective">
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Chief complaint, patient history, symptoms..."
              placeholderTextColor={colors.placeholderText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </SOAPSectionWrapper>
        </View>

        {/* ===== O - OBJECTIVE ===== */}
        <View style={{ marginTop: 24 }}>
          <SOAPSectionWrapper section="objective">
            <View style={styles.vitalsGrid}>
              <View style={styles.vitalItem}>
                <VitalInput
                  label="BP (mmHg)"
                  value={bpValue}
                  onChangeText={setBpValue}
                  placeholder="120/80"
                  icon={Heart}
                />
              </View>
              <View style={styles.vitalItem}>
                <VitalInput
                  label="Weight (kg)"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="65"
                  icon={Scale}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.vitalItem}>
                <VitalInput
                  label="FHR (bpm)"
                  value={fhr}
                  onChangeText={setFhr}
                  placeholder="140"
                  icon={Baby}
                  keyboardType="numeric"
                />
              </View>
              {/* AOG Display (computed from today's date, not editable) */}
              <View style={styles.vitalItem}>
                <Text style={styles.inputLabel}>AOG</Text>
                <View style={styles.aogDisplay}>
                  <Calendar size={18} color="#14b8a6" strokeWidth={1.5} />
                  <Text style={styles.aogValue}>{aogDisplay || "—"}</Text>
                </View>
              </View>
            </View>
          </SOAPSectionWrapper>
        </View>

        {/* ===== A - ASSESSMENT ===== */}
        <View style={{ marginTop: 24 }}>
          <SOAPSectionWrapper section="assessment">
            {/* Diagnosis Field */}
            <TextInput
              style={[styles.textArea, { minHeight: 80 }]}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="Diagnosis, clinical impression..."
              placeholderTextColor={colors.placeholderText}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            {/* Risk Level Toggle */}
            <View style={[styles.riskToggleContainer, { marginTop: 12 }]}>
              <TouchableOpacity
                onPress={() => setRiskLevel("low")}
                style={[
                  styles.riskToggleButton,
                  riskLevel === "low" && styles.riskToggleLowActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.riskToggleText,
                    riskLevel === "low" && styles.riskToggleLowActiveText,
                  ]}
                >
                  LR
                </Text>
                <Text
                  style={[
                    styles.riskToggleLabel,
                    riskLevel === "low" && styles.riskToggleLowActiveText,
                  ]}
                >
                  Low Risk
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRiskLevel("high")}
                style={[
                  styles.riskToggleButton,
                  riskLevel === "high" && styles.riskToggleHighActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.riskToggleText,
                    riskLevel === "high" && styles.riskToggleHighActiveText,
                  ]}
                >
                  HR
                </Text>
                <Text
                  style={[
                    styles.riskToggleLabel,
                    riskLevel === "high" && styles.riskToggleHighActiveText,
                  ]}
                >
                  High Risk
                </Text>
              </TouchableOpacity>
            </View>
          </SOAPSectionWrapper>
        </View>

        {/* ===== P - PLAN ===== */}
        <View style={{ marginTop: 24 }}>
          <SOAPSectionWrapper section="plan">
            {/* Recommendations */}
            <TextInput
              style={styles.textArea}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Treatment plan, recommendations, advice..."
              placeholderTextColor={colors.placeholderText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Active Medications (ongoing from previous visits) */}
            {bookletId && (
              <View style={{ marginTop: 12 }}>
                <ActiveMedicationsManager
                  bookletId={bookletId}
                  defaultExtendDate={followUpDate}
                  editingEntryId={editingEntryId ?? undefined}
                />
              </View>
            )}

            {/* Medications Section (Collapsible) */}
            <TouchableOpacity
              onPress={() => setMedicationsExpanded(!medicationsExpanded)}
              style={[styles.collapsibleHeader, { marginTop: 12 }]}
              activeOpacity={0.7}
            >
              <View style={styles.collapsibleHeaderLeft}>
                <Pill size={18} color="#22c55e" strokeWidth={1.5} />
                <Text style={styles.collapsibleHeaderText}>
                  New Medications{" "}
                  {pendingMedications.length > 0
                    ? `(${pendingMedications.length})`
                    : "(Optional)"}
                </Text>
              </View>
              {medicationsExpanded ? (
                <ChevronDown size={20} color="#6b7280" strokeWidth={1.5} />
              ) : (
                <ChevronRight size={20} color="#6b7280" strokeWidth={1.5} />
              )}
            </TouchableOpacity>
            <AnimatedCollapsible expanded={medicationsExpanded}>
              <View style={styles.collapsibleContent}>
                <MedicationForm
                  doctorId={doctorProfile?._id}
                  pendingMeds={pendingMedications}
                  onAddMedication={handleAddMedication}
                  onRemoveMedication={handleRemoveMedication}
                  onUpdateMedication={handleUpdateMedication}
                  defaultEndDate={followUpDate}
                  activeMedications={filteredActiveMedications}
                />
              </View>
            </AnimatedCollapsible>

            {/* Lab Requests Section (Collapsible) */}
            <TouchableOpacity
              onPress={() => setLabsExpanded(!labsExpanded)}
              style={[styles.collapsibleHeader, { marginTop: 12 }]}
              activeOpacity={0.7}
            >
              <View style={styles.collapsibleHeaderLeft}>
                <FlaskConical size={18} color="#3b82f6" strokeWidth={1.5} />
                <Text style={styles.collapsibleHeaderText}>
                  Lab Requests{" "}
                  {pendingLabRequests.length > 0
                    ? `(${pendingLabRequests.length})`
                    : "(Optional)"}
                </Text>
              </View>
              {labsExpanded ? (
                <ChevronDown size={20} color="#6b7280" strokeWidth={1.5} />
              ) : (
                <ChevronRight size={20} color="#6b7280" strokeWidth={1.5} />
              )}
            </TouchableOpacity>
            <AnimatedCollapsible expanded={labsExpanded}>
              <View style={styles.collapsibleContent}>
                <LabRequestForm
                  doctorId={doctorProfile?._id}
                  pendingLabs={pendingLabRequests}
                  onAddLab={handleAddLabRequest}
                  onRemoveLab={handleRemoveLabRequest}
                  onUpdateLab={handleUpdateLab}
                />
              </View>
            </AnimatedCollapsible>

            {/* Follow-up Date (inside Plan section) */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
              FOLLOW-UP VISIT
            </Text>
            <View style={styles.followUpContainer}>
              <TouchableOpacity
                onPress={handleOpenFollowUpPicker}
                style={[
                  styles.datePickerButton,
                  followUpDate && styles.datePickerButtonSelected,
                ]}
                activeOpacity={0.7}
              >
                <CalendarClock
                  size={20}
                  color={followUpDate ? "#10b981" : "#6b7280"}
                  strokeWidth={1.5}
                />
                <Text
                  style={[
                    styles.datePickerText,
                    !followUpDate && styles.datePickerPlaceholder,
                  ]}
                >
                  {followUpDate
                    ? formatDate(followUpDate, "long")
                    : "Select next visit date"}
                </Text>
              </TouchableOpacity>
              {followUpDate && (
                <TouchableOpacity
                  onPress={clearFollowUpDate}
                  style={styles.clearButton}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#94a3b8" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </SOAPSectionWrapper>
        </View>
        {/* End of Plan Section */}
        {showFollowUpPicker && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={tempFollowUpDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={handleFollowUpDateChange}
              themeVariant="dark"
            />
            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={handleFollowUpPickerDone}
                style={styles.datePickerDoneButton}
                activeOpacity={0.8}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Dynamic color palette based on color scheme
interface ColorPalette {
  containerBg: string;
  headerBorder: string;
  cancelText: string;
  headerTitle: string;
  patientBarBg: string;
  patientAvatarBorder: string;
  patientName: string;
  patientAge: string;
  sectionLabel: string;
  inputLabel: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholderText: string;
}

function getColors(isDark: boolean): ColorPalette {
  return {
    containerBg: isDark ? "#101822" : "#ffffff",
    headerBorder: isDark ? "#1e293b" : "#e5e7eb",
    cancelText: isDark ? "#92a9c9" : "#6b7280",
    headerTitle: isDark ? "#ffffff" : "#111827",
    patientBarBg: isDark ? "rgba(25, 36, 51, 0.5)" : "rgba(249, 250, 251, 0.8)",
    patientAvatarBorder: isDark ? "#334155" : "#e5e7eb",
    patientName: isDark ? "#ffffff" : "#111827",
    patientAge: isDark ? "#94a3b8" : "#6b7280",
    sectionLabel: isDark ? "#92a9c9" : "#6b7280",
    inputLabel: isDark ? "#ffffff" : "#374151",
    inputBg: isDark ? "#192433" : "#f9fafb",
    inputBorder: isDark ? "#324867" : "#d1d5db",
    inputText: isDark ? "#ffffff" : "#111827",
    placeholderText: isDark ? "#4b5563" : "#9ca3af",
  };
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.containerBg,
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      color: "#94a3b8",
      fontSize: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.headerBorder,
    },
    cancelButton: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.cancelText,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.headerTitle,
    },
    saveButton: {
      backgroundColor: "#3b82f6",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    saveButtonDisabled: {
      backgroundColor: "#64748b",
      shadowOpacity: 0,
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#ffffff",
    },
    patientBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.patientBarBg,
      gap: 12,
    },
    patientAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#3b82f6",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.patientAvatarBorder,
    },
    patientAvatarText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#ffffff",
    },
    patientInfo: {
      flex: 1,
    },
    patientNameRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    patientName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.patientName,
    },
    patientAge: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.patientAge,
    },
    patientIdBadge: {
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    patientIdText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#60a5fa",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 4,
    },
    statusActive: {
      backgroundColor: "rgba(16, 185, 129, 0.1)",
    },
    statusInactive: {
      backgroundColor: "rgba(107, 114, 128, 0.1)",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "500",
    },
    statusTextActive: {
      color: "#10b981",
    },
    statusTextInactive: {
      color: "#6b7280",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.sectionLabel,
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    vitalsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    vitalItem: {
      width: "48%",
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.inputLabel,
      marginBottom: 4,
    },
    aogDisplay: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 40,
      gap: 8,
    },
    aogValue: {
      fontSize: 14,
      fontWeight: "500",
      color: "#14b8a6",
    },
    divider: {
      height: 1,
      backgroundColor: colors.headerBorder,
      marginVertical: 24,
    },
    textArea: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.inputText,
      minHeight: 120,
      lineHeight: 24,
    },
    datePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    datePickerText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.inputText,
    },
    readOnlyDateText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.inputText,
    },
    datePickerContainer: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      overflow: "hidden",
    },
    datePickerDoneButton: {
      alignItems: "center",
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.inputBorder,
    },
    datePickerDoneText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#3b82f6",
    },
    followUpContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    datePickerButtonSelected: {
      borderColor: "#10b981",
    },
    datePickerPlaceholder: {
      color: colors.placeholderText,
    },
    clearButton: {
      width: 40,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
    },
    collapsibleHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    collapsibleHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    collapsibleHeaderText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.inputText,
    },
    collapsibleContent: {
      marginTop: 8,
    },
    riskToggleContainer: {
      flexDirection: "row",
      gap: 12,
    },
    riskToggleButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingVertical: 14,
      gap: 8,
    },
    riskToggleLowActive: {
      backgroundColor: "rgba(34, 197, 94, 0.15)",
      borderColor: "#22c55e",
    },
    riskToggleHighActive: {
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      borderColor: "#ef4444",
    },
    riskToggleText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#6b7280",
    },
    riskToggleLowActiveText: {
      color: "#22c55e",
    },
    riskToggleHighActiveText: {
      color: "#ef4444",
    },
    riskToggleLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: "#6b7280",
    },
  });
}
