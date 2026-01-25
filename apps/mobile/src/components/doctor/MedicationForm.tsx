/**
 * Medication Form
 *
 * Displays pending medications as cards and provides a button to open
 * the full medication entry modal. Cleaner, more professional design
 * that delegates the complex entry flow to the modal.
 */

import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  Pill,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react-native";
import { Id } from "@convex/_generated/dataModel";
import { useThemeColors } from "@/theme";
import {
  formatDosage,
  type DosageUnit,
  type PendingMedication,
  type MedicationFrequency,
  type MedicationWithLogs,
} from "@/types";
import { formatDate } from "@/utils";
import { AddMedicationModal } from "./AddMedicationModal";

export type { PendingMedication };

// Frequency labels
const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  1: "QD",
  2: "BID",
  3: "TID",
  4: "PRN",
};

interface MedicationFormProps {
  pendingMeds: PendingMedication[];
  onAddMedication: (med: Omit<PendingMedication, "id">) => void;
  onRemoveMedication: (id: string) => void;
  onUpdateMedication?: (id: string, updates: Partial<PendingMedication>) => void;
  defaultEndDate?: Date | null;
  doctorId?: Id<"doctorProfiles">;
  /** Active medications from other entries (to prevent duplicates) */
  activeMedications?: MedicationWithLogs[];
}

export function MedicationForm({
  pendingMeds,
  onAddMedication,
  onRemoveMedication,
  onUpdateMedication,
  defaultEndDate,
  doctorId,
  activeMedications,
}: MedicationFormProps) {
  const colors = useThemeColors();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Get list of already-added medication names for duplicate prevention
  const existingMedications = [
    ...pendingMeds.map((m) => m.name),
    ...(activeMedications?.map((m) => m.name) || []),
  ];

  // Handle adding medications from the modal
  const handleAddMedications = useCallback(
    (medications: Omit<PendingMedication, "id">[]) => {
      medications.forEach((med) => {
        onAddMedication(med);
      });
    },
    [onAddMedication]
  );

  // Toggle expanded state
  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pill size={18} color={colors.textMuted} strokeWidth={1.5} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Prescriptions
        </Text>
        {pendingMeds.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.countText, { color: colors.accent }]}>
              {pendingMeds.length}
            </Text>
          </View>
        )}
      </View>

      {/* Pending medications list */}
      {pendingMeds.length > 0 && (
        <View style={styles.medicationsList}>
          {pendingMeds.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              isExpanded={expandedId === med.id}
              onToggleExpand={() => toggleExpanded(med.id)}
              onRemove={() => onRemoveMedication(med.id)}
              onUpdate={onUpdateMedication ? (updates) => onUpdateMedication(med.id, updates) : undefined}
              colors={colors}
            />
          ))}
        </View>
      )}

      {/* Add Medication Button */}
      <Pressable
        onPress={() => setShowModal(true)}
        style={[styles.addButton, { borderColor: colors.border }]}
      >
        <Plus size={18} color={colors.accent} strokeWidth={2} />
        <Text style={[styles.addButtonText, { color: colors.accent }]}>
          Add Medication
        </Text>
      </Pressable>

      {/* Modal */}
      <AddMedicationModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAddMedications={handleAddMedications}
        doctorId={doctorId}
        defaultEndDate={defaultEndDate}
        existingMedications={existingMedications}
      />
    </View>
  );
}

// Medication Card Component
interface MedicationCardProps {
  medication: PendingMedication;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdate?: (updates: Partial<PendingMedication>) => void;
  colors: ReturnType<typeof useThemeColors>;
}

function MedicationCard({
  medication,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdate,
  colors,
}: MedicationCardProps) {
  const dosageDisplay = formatDosage(
    medication.dosageAmount,
    medication.dosageUnit as DosageUnit
  );
  const frequencyLabel = FREQUENCY_LABELS[medication.frequencyPerDay] || `${medication.frequencyPerDay}x`;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Main row */}
      <View style={styles.cardMain}>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {medication.name}
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
            {dosageDisplay} • {frequencyLabel}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          {/* Quick actions badge */}
          <View style={[styles.actionBadge, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.actionBadgeText, { color: colors.accent }]}>SAVE</Text>
          </View>

          {/* More details toggle */}
          <Pressable
            onPress={onToggleExpand}
            style={[styles.moreButton, { backgroundColor: colors.surface2 }]}
          >
            <Text style={[styles.moreButtonText, { color: colors.textMuted }]}>
              {isExpanded ? "LESS" : "MORE DETAILS"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Expanded details */}
      {isExpanded && (
        <View style={[styles.cardExpanded, { borderTopColor: colors.border }]}>
          {medication.genericName && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSubtle }]}>Generic</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{medication.genericName}</Text>
            </View>
          )}
          {medication.instructions && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSubtle }]}>Instructions</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{medication.instructions}</Text>
            </View>
          )}
          {medication.endDate && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSubtle }]}>Until</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(medication.endDate)}</Text>
            </View>
          )}

          {/* Remove button */}
          <Pressable
            onPress={onRemove}
            style={[styles.removeButton, { borderColor: colors.dangerLight }]}
          >
            <Trash2 size={14} color={colors.danger} strokeWidth={1.5} />
            <Text style={[styles.removeButtonText, { color: colors.danger }]}>Remove</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// Export helper to check for unfinished medication
export function hasUnfinishedMedicationForm(name: string, dosageAmount: string): boolean {
  return name.trim() !== "" || dosageAmount.trim() !== "";
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
  },
  medicationsList: {
    marginBottom: 12,
    gap: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  moreButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  moreButtonText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  cardExpanded: {
    padding: 12,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    flex: 1,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
