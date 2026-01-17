import { View, Text, ScrollView, Modal, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Calendar, Stethoscope, FileText, ClipboardList } from "lucide-react-native";
import { formatDate } from "@/utils";
import type { MedicalEntryWithDoctor, Vitals } from "@/types";
import { ENTRY_TYPE_LABELS } from "@/types";

interface VisitSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  entry: MedicalEntryWithDoctor | null;
  motherName?: string;
  bookletLabel?: string;
}

export function VisitSummaryModal({
  visible,
  onClose,
  entry,
  motherName,
  bookletLabel,
}: VisitSummaryModalProps) {
  if (!entry) return null;

  const entryTypeLabel = ENTRY_TYPE_LABELS[entry.entryType] || entry.entryType;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Visit Summary</Text>
            {motherName && (
              <Text style={styles.headerSubtitle}>{motherName}</Text>
            )}
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#94a3b8" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Entry Type Badge */}
          <View style={styles.entryTypeBadge}>
            <Stethoscope size={16} color="#3b82f6" />
            <Text style={styles.entryTypeText}>{entryTypeLabel}</Text>
          </View>

          {/* Visit Date */}
          <View style={styles.infoRow}>
            <Calendar size={18} color="#64748b" />
            <Text style={styles.infoLabel}>Visit Date:</Text>
            <Text style={styles.infoValue}>
              {formatDate(entry.visitDate, "long")}
            </Text>
          </View>

          {/* Vitals Section */}
          {entry.vitals && <VitalsSection vitals={entry.vitals} />}

          {/* Notes Section */}
          {entry.notes && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={18} color="#64748b" />
                <Text style={styles.sectionTitle}>Notes</Text>
              </View>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{entry.notes}</Text>
              </View>
            </View>
          )}

          {/* Diagnosis Section */}
          {entry.diagnosis && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ClipboardList size={18} color="#64748b" />
                <Text style={styles.sectionTitle}>Diagnosis</Text>
              </View>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{entry.diagnosis}</Text>
              </View>
            </View>
          )}

          {/* Recommendations Section */}
          {entry.recommendations && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{entry.recommendations}</Text>
              </View>
            </View>
          )}

          {/* Follow-up Date */}
          {entry.followUpDate && (
            <View style={styles.followUpContainer}>
              <Text style={styles.followUpLabel}>Follow-up scheduled:</Text>
              <Text style={styles.followUpDate}>
                {formatDate(entry.followUpDate, "long")}
              </Text>
            </View>
          )}

          {/* Spacer */}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Vitals Section Component
interface VitalsSectionProps {
  vitals: Vitals;
}

function VitalsSection({ vitals }: VitalsSectionProps) {
  const hasVitals =
    vitals.bloodPressure ||
    vitals.weight ||
    vitals.temperature ||
    vitals.heartRate ||
    vitals.fetalHeartRate ||
    vitals.fundalHeight ||
    vitals.aog;

  if (!hasVitals) return null;

  return (
    <View style={styles.vitalsSection}>
      <Text style={styles.sectionTitle}>Vitals</Text>
      <View style={styles.vitalsGrid}>
        {vitals.bloodPressure && (
          <VitalItem label="Blood Pressure" value={vitals.bloodPressure} />
        )}
        {vitals.weight && (
          <VitalItem label="Weight" value={`${vitals.weight} kg`} />
        )}
        {vitals.temperature && (
          <VitalItem label="Temperature" value={`${vitals.temperature}°C`} />
        )}
        {vitals.heartRate && (
          <VitalItem label="Heart Rate" value={`${vitals.heartRate} bpm`} />
        )}
        {vitals.fetalHeartRate && (
          <VitalItem label="Fetal HR" value={`${vitals.fetalHeartRate} bpm`} />
        )}
        {vitals.fundalHeight && (
          <VitalItem label="Fundal Height" value={`${vitals.fundalHeight} cm`} />
        )}
        {vitals.aog && <VitalItem label="AOG" value={vitals.aog} />}
      </View>
    </View>
  );
}

function VitalItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.vitalItem}>
      <Text style={styles.vitalLabel}>{label}</Text>
      <Text style={styles.vitalValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  entryTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  entryTypeText: {
    color: "#60a5fa",
    fontSize: 14,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 14,
  },
  infoValue: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  notesBox: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  notesText: {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 22,
  },
  vitalsSection: {
    marginBottom: 20,
  },
  vitalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  vitalItem: {
    width: "50%",
    marginBottom: 12,
  },
  vitalLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  vitalValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  followUpContainer: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  followUpLabel: {
    color: "#f59e0b",
    fontSize: 13,
  },
  followUpDate: {
    color: "#fbbf24",
    fontSize: 13,
    fontWeight: "600",
  },
});
