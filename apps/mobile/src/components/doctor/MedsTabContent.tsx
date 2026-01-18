import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { Pill, Clock } from "lucide-react-native";
import { formatDate } from "@/utils";
import type { Medication } from "@/types";
import { FREQUENCY_LABELS, DEFAULT_TIMES_BY_FREQUENCY } from "@/types";

interface MedsTabContentProps {
  medications: Medication[];
  activeMeds: Medication[];
  /** If not provided, edit button will be hidden */
  onEditMedication?: (med: Medication) => void;
  /** If not provided, stop button will be hidden */
  onStopMedication?: (med: Medication) => void;
  /** If true, hides action buttons (for read-only views like mother's view) */
  readOnly?: boolean;
}

export function MedsTabContent({
  medications,
  activeMeds,
  onEditMedication,
  onStopMedication,
  readOnly = false,
}: MedsTabContentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const styles = createStyles(colors);

  const inactiveMeds = medications.filter((m) => !m.isActive);

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
              onEdit={!readOnly && onEditMedication ? () => onEditMedication(med) : undefined}
              onStop={!readOnly && onStopMedication ? () => onStopMedication(med) : undefined}
              readOnly={readOnly}
              isDark={isDark}
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
  onEdit?: () => void;
  onStop?: () => void;
  readOnly?: boolean;
  isDark?: boolean;
}

function MedicationCard({ medication, onEdit, onStop, readOnly, isDark = true }: MedicationCardProps) {
  const colors = getColors(isDark);
  const styles = createStyles(colors);
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
        {!readOnly && (onEdit || onStop) && (
          <View style={styles.buttonGroup}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={styles.editButton}
                activeOpacity={0.7}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onStop && (
              <TouchableOpacity
                onPress={onStop}
                style={styles.stopButton}
                activeOpacity={0.7}
              >
                <Text style={styles.stopButtonText}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// Dynamic color palette based on color scheme
interface ColorPalette {
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  iconContainerBg: string;
  instructionsBg: string;
  instructionsBorder: string;
  instructionsText: string;
  countBadgeBg: string;
  editButtonBg: string;
  inactiveCardBg: string;
  inactiveBorder: string;
  inactiveIconBg: string;
}

function getColors(isDark: boolean): ColorPalette {
  return {
    cardBg: isDark ? "#1e293b" : "#ffffff",
    cardBorder: isDark ? "#334155" : "#e5e7eb",
    textPrimary: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#94a3b8" : "#6b7280",
    iconContainerBg: isDark ? "#374151" : "#f3f4f6",
    instructionsBg: isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(243, 244, 246, 0.8)",
    instructionsBorder: isDark ? "rgba(71, 85, 105, 0.5)" : "rgba(229, 231, 235, 1)",
    instructionsText: isDark ? "#cbd5e1" : "#4b5563",
    countBadgeBg: isDark ? "#334155" : "#e5e7eb",
    editButtonBg: isDark ? "#334155" : "#e5e7eb",
    inactiveCardBg: isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(249, 250, 251, 0.8)",
    inactiveBorder: isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(229, 231, 235, 0.8)",
    inactiveIconBg: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(243, 244, 246, 0.8)",
  };
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
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
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
    },
    countBadge: {
      backgroundColor: colors.countBadgeBg,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    countBadgeText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "500",
    },
    inactiveSectionTitle: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "600",
    },
    countBadgeInactive: {
      backgroundColor: colors.inactiveBorder,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    countBadgeTextInactive: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "500",
    },

    // Medication Card
    medicationCard: {
      backgroundColor: colors.cardBg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
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
      backgroundColor: colors.iconContainerBg,
      alignItems: "center",
      justifyContent: "center",
    },
    iconContainerInactive: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.inactiveIconBg,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitleContainer: {
      flex: 1,
    },
    medName: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    medDosage: {
      color: colors.textSecondary,
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
      backgroundColor: colors.instructionsBg,
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.instructionsBorder,
    },
    instructionsLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    instructionsText: {
      color: colors.instructionsText,
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
      borderTopColor: colors.cardBorder,
    },
    scheduleInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    scheduleText: {
      color: colors.textSecondary,
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
      backgroundColor: colors.editButtonBg,
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
      backgroundColor: colors.inactiveCardBg,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.inactiveBorder,
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
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    inactiveMedDosage: {
      color: colors.textSecondary,
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
}
