import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Pill, Clock, CheckCircle2 } from "lucide-react-native";
import { formatDate } from "@/utils";
import type { Medication } from "@/types";
import { FREQUENCY_LABELS, DEFAULT_TIMES_BY_FREQUENCY } from "@/types";

interface MedsTabContentProps {
  medications: Medication[];
  activeMeds: Medication[];
  onEditMedication: (med: Medication) => void;
  onStopMedication: (med: Medication) => void;
  /** Daily adherence data - if not provided, shows placeholder */
  adherenceData?: {
    totalDoses: number;
    takenDoses: number;
    percentage: number;
  };
}

export function MedsTabContent({
  medications,
  activeMeds,
  onEditMedication,
  onStopMedication,
  adherenceData,
}: MedsTabContentProps) {
  const inactiveMeds = medications.filter((m) => !m.isActive);

  // Default adherence data if not provided
  const adherence = adherenceData || {
    totalDoses: activeMeds.reduce((sum, m) => sum + m.frequencyPerDay, 0),
    takenDoses: 0,
    percentage: 0,
  };

  if (medications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Pill size={32} color="#64748b" strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyText}>No medications yet</Text>
        <Text style={styles.emptySubtext}>
          Add medications when creating an entry
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Daily Adherence Card */}
      <View style={styles.adherenceCard}>
        <View style={styles.adherenceHeader}>
          <View style={styles.adherenceTitle}>
            <CheckCircle2 size={18} color="#3b82f6" strokeWidth={2} />
            <Text style={styles.adherenceTitleText}>Daily Adherence</Text>
          </View>
          <View style={styles.adherenceBadge}>
            <Text style={styles.adherenceBadgeText}>{adherence.percentage}%</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${adherence.percentage}%` }]}
          />
        </View>
        <Text style={styles.adherenceSubtext}>
          {adherence.takenDoses} of {adherence.totalDoses} doses taken today
        </Text>
      </View>

      {/* Active Medications Section */}
      {activeMeds.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Medications</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{activeMeds.length} Active</Text>
            </View>
          </View>

          {activeMeds.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              onEdit={() => onEditMedication(med)}
              onStop={() => onStopMedication(med)}
            />
          ))}
        </View>
      )}

      {/* Past Medications Section */}
      {inactiveMeds.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.inactiveSectionTitle}>Past Medications</Text>
            <View style={styles.countBadgeInactive}>
              <Text style={styles.countBadgeTextInactive}>
                {inactiveMeds.length}
              </Text>
            </View>
          </View>

          {inactiveMeds.map((med) => (
            <View key={med.id} style={styles.inactiveCard}>
              <View style={styles.inactiveCardHeader}>
                <View style={styles.iconContainerInactive}>
                  <Pill size={20} color="#64748b" strokeWidth={1.5} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.inactiveMedName}>{med.name}</Text>
                  <Text style={styles.inactiveMedDosage}>{med.dosage}</Text>
                </View>
              </View>
              {med.endDate && (
                <Text style={styles.endDate}>
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

// Medication Card Component
interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  onStop: () => void;
}

function MedicationCard({ medication, onEdit, onStop }: MedicationCardProps) {
  // Get schedule time from timesOfDay or default
  const scheduleTime =
    medication.timesOfDay?.[0] ||
    DEFAULT_TIMES_BY_FREQUENCY[medication.frequencyPerDay]?.[0] ||
    "Daily";

  const frequencyLabel = FREQUENCY_LABELS[medication.frequencyPerDay];

  return (
    <View style={styles.medicationCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconContainer}>
            <Pill size={20} color="#9ca3af" strokeWidth={1.5} />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.medName}>{medication.name}</Text>
            <Text style={styles.medDosage}>{medication.dosage}</Text>
          </View>
        </View>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeBadgeText}>ACTIVE</Text>
        </View>
      </View>

      {/* Instructions */}
      {medication.instructions && (
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsLabel}>INSTRUCTIONS</Text>
          <Text style={styles.instructionsText}>
            "{medication.instructions}"
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.scheduleInfo}>
          <Clock size={14} color="#64748b" strokeWidth={1.5} />
          <Text style={styles.scheduleText}>
            {scheduleTime} {frequencyLabel}
          </Text>
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={onEdit}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onStop}
            style={styles.stopButton}
            activeOpacity={0.7}
          >
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(100, 116, 139, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
  },

  // Adherence Card
  adherenceCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  adherenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  adherenceTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adherenceTitleText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
  },
  adherenceBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adherenceBadgeText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#3b82f6",
    borderRadius: 5,
  },
  adherenceSubtext: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "right",
    marginTop: 8,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  countBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  inactiveSectionTitle: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  countBadgeInactive: {
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeTextInactive: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },

  // Medication Card
  medicationCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerInactive: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(55, 65, 81, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleContainer: {
    flex: 1,
  },
  medName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  medDosage: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  activeBadgeText: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Instructions
  instructionsBox: {
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.5)",
  },
  instructionsLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  instructionsText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
  },

  // Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  scheduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scheduleText: {
    color: "#64748b",
    fontSize: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#334155",
  },
  editButtonText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "600",
  },
  stopButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  stopButtonText: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: "600",
  },

  // Inactive Card
  inactiveCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.5)",
    opacity: 0.7,
  },
  inactiveCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  inactiveMedName: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  inactiveMedDosage: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  endDate: {
    color: "#475569",
    fontSize: 11,
    marginTop: 8,
    marginLeft: 52,
  },
});
