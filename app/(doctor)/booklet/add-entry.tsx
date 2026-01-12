import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
} from "lucide-react-native";
import {
  useCurrentUser,
  useBookletByIdWithMother,
  useEntriesByBooklet,
  useCreateEntry,
  useUpdateEntry,
} from "@/hooks";
import { computeAOG, formatDate, getDateString } from "@/utils";
import { VitalInput, LoadingScreen } from "@/components/ui";
import type { MedicalEntryWithDoctor } from "@/types";

export default function AddEntryScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Data hooks
  const currentUser = useCurrentUser();
  const doctorProfile = currentUser?.doctorProfile;
  const booklet = useBookletByIdWithMother(bookletId);
  const entries = useEntriesByBooklet(bookletId);

  // Mutations
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();

  // Form state
  const [entryDate, setEntryDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bpValue, setBpValue] = useState("");
  const [weight, setWeight] = useState("");
  const [fhr, setFhr] = useState("");
  const [notes, setNotes] = useState("");
  const [instructions, setInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [tempFollowUpDate, setTempFollowUpDate] = useState(new Date());
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Track the entry being edited (if any)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const isLoading =
    currentUser === undefined ||
    booklet === undefined ||
    entries === undefined;

  // Find entry by date
  const findEntryByDate = (date: Date): MedicalEntryWithDoctor | null => {
    if (!entries) return null;
    const dateStr = getDateString(date);
    return entries.find((e) => getDateString(e.visitDate) === dateStr) || null;
  };

  // Check if current date has an existing entry
  const isEdit = editingEntryId !== null;

  // Computed AOG based on today's date (not entry date)
  const computedAOG = booklet?.expectedDueDate
    ? computeAOG(booklet.expectedDueDate, new Date())
    : null;

  // Extract just the weeks from AOG (e.g., "32 weeks, 3 days" -> "32")
  const aogWeeks = computedAOG
    ? computedAOG.split(" ")[0]
    : null;

  // Patient info for context bar
  const patientInfo = booklet
    ? {
        name: booklet.motherName,
        status: booklet.status,
      }
    : null;

  // Check if form has unsaved data
  const hasUnsavedChanges = () => {
    return (
      notes !== "" ||
      instructions !== "" ||
      bpValue !== "" ||
      weight !== "" ||
      fhr !== "" ||
      followUpDate !== null
    );
  };

  // Prefill form with entry data
  const prefillForm = (entry: MedicalEntryWithDoctor) => {
    setBpValue(entry.vitals?.bloodPressure || "");
    setWeight(entry.vitals?.weight?.toString() || "");
    setFhr(entry.vitals?.fetalHeartRate?.toString() || "");
    setNotes(entry.notes || "");
    setInstructions(entry.recommendations || "");
    setFollowUpDate(entry.followUpDate ? new Date(entry.followUpDate) : null);
    setEditingEntryId(entry.id);
  };

  // Clear form
  const clearForm = () => {
    setBpValue("");
    setWeight("");
    setFhr("");
    setNotes("");
    setInstructions("");
    setFollowUpDate(null);
    setEditingEntryId(null);
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
      if (aogWeeks) entryVitals.aog = aogWeeks;

      if (isEdit && editingEntryId) {
        // Update existing entry
        await updateEntry({
          id: editingEntryId,
          updates: {
            entryType: "prenatal_checkup",
            notes,
            recommendations: instructions || undefined,
            vitals: Object.keys(entryVitals).length > 0 ? entryVitals : undefined,
            followUpDate: followUpDate ? followUpDate.getTime() : undefined,
          },
        });
      } else {
        // Create new entry
        await createEntry({
          bookletId,
          doctorId: doctorProfile._id,
          entryType: "prenatal_checkup",
          visitDate: entryDate,
          notes,
          recommendations: instructions || undefined,
          vitals: Object.keys(entryVitals).length > 0 ? entryVitals : undefined,
          followUpDate: followUpDate ? followUpDate.getTime() : undefined,
        });
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
            <Text style={styles.patientName}>{patientInfo.name}</Text>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Entry Date Section */}
        <Text style={styles.sectionLabel}>ENTRY DATE</Text>
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

        {/* Vitals Section */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>VITALS</Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalItem}>
            <VitalInput
              label="BP (mmHg)"
              value={bpValue}
              onChangeText={setBpValue}
              placeholder="120/80"
              icon={Heart}
              iconColor="#f43f5e"
            />
          </View>
          <View style={styles.vitalItem}>
            <VitalInput
              label="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              placeholder="65"
              icon={Scale}
              iconColor="#60a5fa"
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
              iconColor="#f472b6"
              keyboardType="numeric"
            />
          </View>
          {/* AOG Display (computed from today's date, not editable) */}
          <View style={styles.vitalItem}>
            <Text style={styles.inputLabel}>AOG (weeks)</Text>
            <View style={styles.aogDisplay}>
              <Calendar size={20} color="#a78bfa" strokeWidth={1.5} />
              <Text style={styles.aogValue}>{aogWeeks || "—"}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Clinical Notes Section */}
        <Text style={styles.sectionLabel}>CLINICAL NOTES</Text>
        <TextInput
          style={styles.textArea}
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter clinical observations..."
          placeholderTextColor="#4b5563"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* Instructions Section */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          INSTRUCTIONS
        </Text>
        <TextInput
          style={styles.textArea}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Add prescriptions or advice..."
          placeholderTextColor="#4b5563"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Next Visitation Section */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          NEXT VISITATION (OPTIONAL)
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101822",
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
    borderBottomColor: "#1e293b",
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: "500",
    color: "#92a9c9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
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
    backgroundColor: "rgba(25, 36, 51, 0.5)",
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
    borderColor: "#334155",
  },
  patientAvatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
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
    color: "#92a9c9",
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
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 6,
  },
  aogDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#192433",
    borderWidth: 1,
    borderColor: "#324867",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  aogValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#a78bfa",
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 24,
  },
  textArea: {
    backgroundColor: "#192433",
    borderWidth: 1,
    borderColor: "#324867",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#ffffff",
    minHeight: 120,
    lineHeight: 24,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#192433",
    borderWidth: 1,
    borderColor: "#324867",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  datePickerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
  datePickerContainer: {
    backgroundColor: "#192433",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#324867",
    overflow: "hidden",
  },
  datePickerDoneButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#324867",
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
    color: "#6b7280",
  },
  clearButton: {
    width: 40,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#192433",
    borderWidth: 1,
    borderColor: "#324867",
    borderRadius: 12,
  },
});
