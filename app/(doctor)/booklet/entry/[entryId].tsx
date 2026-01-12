import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Share2,
  Heart,
  Scale,
  Baby,
  Calendar,
  Stethoscope,
  FileText,
  CalendarPlus,
} from "lucide-react-native";
import {
  useEntryById,
  useBookletById,
  useMedicationsByEntry,
  useLabsByEntry,
} from "@/hooks";
import { formatDate, computeAOG } from "@/utils";
import { VitalCard, InstructionsCard, LoadingScreen } from "@/components/ui";
import { ENTRY_TYPE_LABELS } from "@/types";

export default function EntryDetailScreen() {
  const { entryId, bookletId } = useLocalSearchParams<{
    entryId: string;
    bookletId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const entry = useEntryById(entryId);
  const booklet = useBookletById(bookletId);
  const medications = useMedicationsByEntry(entryId);
  const labs = useLabsByEntry(entryId);

  const isLoading =
    entry === undefined ||
    booklet === undefined ||
    medications === undefined ||
    labs === undefined;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Entry not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Compute AOG for this entry's visit date from booklet's expected due date
  const aog = booklet?.expectedDueDate
    ? computeAOG(booklet.expectedDueDate, entry.visitDate)
    : entry.vitals?.aog || null;

  const visitDateFormatted = formatDate(entry.visitDate, "long");

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#cbd5e1" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visit Details</Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Share2 size={22} color="#cbd5e1" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date & Doctor Section */}
        <View style={styles.dateSection}>
          <Text style={styles.dateHeading}>{visitDateFormatted}</Text>
          <View style={styles.doctorInfo}>
            <View style={styles.doctorIcon}>
              <Stethoscope size={14} color="#3b82f6" strokeWidth={1.5} />
            </View>
            <Text style={styles.doctorText}>
              {ENTRY_TYPE_LABELS[entry.entryType]} with {entry.doctorName}
            </Text>
          </View>
        </View>

        {/* Vitals Section */}
        {(entry.vitals?.bloodPressure ||
          entry.vitals?.weight ||
          entry.vitals?.fetalHeartRate ||
          aog) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#3b82f6" strokeWidth={1.5} />
              <Text style={styles.sectionTitle}>Vitals</Text>
            </View>
            <View style={styles.vitalsGrid}>
              {entry.vitals?.bloodPressure && (
                <View style={styles.vitalItem}>
                  <VitalCard
                    label="BP"
                    value={entry.vitals.bloodPressure}
                    unit="mmHg"
                    icon={Heart}
                    iconColor="#f43f5e"
                  />
                </View>
              )}
              {entry.vitals?.weight && (
                <View style={styles.vitalItem}>
                  <VitalCard
                    label="Weight"
                    value={entry.vitals.weight}
                    unit="kg"
                    icon={Scale}
                    iconColor="#60a5fa"
                  />
                </View>
              )}
              {entry.vitals?.fetalHeartRate && (
                <View style={styles.vitalItem}>
                  <VitalCard
                    label="FHR"
                    value={entry.vitals.fetalHeartRate}
                    unit="bpm"
                    icon={Baby}
                    iconColor="#f472b6"
                  />
                </View>
              )}
              {aog && (
                <View style={styles.vitalItem}>
                  <VitalCard
                    label="AOG"
                    value={aog.replace("w", "").replace("d", "").trim().split(" ")[0]}
                    unit="wks"
                    icon={Calendar}
                    iconColor="#a78bfa"
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Doctor's Notes Section */}
        {entry.notes && entry.notes.trim() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color="#94a3b8" strokeWidth={1.5} />
              <Text style={styles.sectionTitle}>Doctor's Notes</Text>
            </View>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{entry.notes}</Text>
            </View>
          </View>
        )}

        {/* Instructions Section */}
        {entry.recommendations && entry.recommendations.trim() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color="#f59e0b" strokeWidth={1.5} />
              <Text style={[styles.sectionTitle, { color: "#fbbf24" }]}>
                Instructions
              </Text>
            </View>
            <InstructionsCard instructions={entry.recommendations} />
          </View>
        )}

        {/* Divider */}
        {((medications && medications.length > 0) ||
          (labs && labs.length > 0)) && <View style={styles.divider} />}

        {/* Medications Section - Placeholder for now */}
        {medications && medications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subSectionTitle}>Prescribed Medications</Text>
            {medications.map((med) => (
              <View key={med.id} style={styles.listItem}>
                <View style={[styles.listIcon, { backgroundColor: "rgba(249, 115, 22, 0.2)" }]}>
                  <Text style={{ fontSize: 16 }}>💊</Text>
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{med.name}</Text>
                  <Text style={styles.listSubtitle}>{med.dosage}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Labs Section - Placeholder for now */}
        {labs && labs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subSectionTitle}>Lab Requests</Text>
            {labs.map((lab) => (
              <View key={lab.id} style={styles.listItem}>
                <View style={[styles.listIcon, { backgroundColor: "rgba(99, 102, 241, 0.2)" }]}>
                  <Text style={{ fontSize: 16 }}>🧪</Text>
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{lab.description}</Text>
                  <Text style={styles.listSubtitle}>
                    Requested {formatDate(lab.requestedDate)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    lab.status === "completed"
                      ? styles.statusCompleted
                      : lab.status === "pending"
                      ? styles.statusPending
                      : styles.statusCancelled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      lab.status === "completed"
                        ? styles.statusTextCompleted
                        : lab.status === "pending"
                        ? styles.statusTextPending
                        : styles.statusTextCancelled,
                    ]}
                  >
                    {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      {entry.followUpDate && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.followUpButton} activeOpacity={0.8}>
            <CalendarPlus size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.followUpButtonText}>Schedule Follow-up</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 12,
    backgroundColor: "rgba(17, 24, 34, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  dateSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  dateHeading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  doctorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  doctorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  vitalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  vitalItem: {
    width: "48%",
  },
  notesCard: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#cbd5e1",
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 24,
    marginHorizontal: 8,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  listSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderColor: "rgba(250, 204, 21, 0.3)",
  },
  statusCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  statusCancelled: {
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    borderColor: "rgba(107, 114, 128, 0.3)",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusTextPending: {
    color: "#facc15",
  },
  statusTextCompleted: {
    color: "#22c55e",
  },
  statusTextCancelled: {
    color: "#6b7280",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#101822",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    padding: 16,
  },
  followUpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  followUpButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
