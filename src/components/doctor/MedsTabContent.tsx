import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { formatDate } from "@/utils";
import type { Medication } from "@/types";

interface MedsTabContentProps {
  medications: Medication[];
  activeMeds: Medication[];
  onEditMedication: (med: Medication) => void;
  onStopMedication: (med: Medication) => void;
}

export function MedsTabContent({
  medications,
  activeMeds,
  onEditMedication,
  onStopMedication,
}: MedsTabContentProps) {
  const inactiveMeds = medications.filter((m) => !m.isActive);

  if (medications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No medications yet</Text>
        <Text style={styles.emptySubtext}>
          Add medications when creating an entry
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Active Medications */}
      {activeMeds.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Active ({activeMeds.length})
          </Text>
          {activeMeds.map((med) => (
            <View key={med.id} style={styles.activeCard}>
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                  {med.instructions && (
                    <Text style={styles.medInstructions}>
                      {med.instructions}
                    </Text>
                  )}
                </View>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    onPress={() => onEditMedication(med)}
                    style={styles.editButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onStopMedication(med)}
                    style={styles.stopButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Inactive Medications */}
      {inactiveMeds.length > 0 && (
        <View>
          <Text style={styles.inactiveSectionTitle}>
            Past ({inactiveMeds.length})
          </Text>
          {inactiveMeds.map((med) => (
            <View key={med.id} style={styles.inactiveCard}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDosage}>{med.dosage}</Text>
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

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: "#475569", // slate-600
    fontSize: 14,
  },
  emptySubtext: {
    color: "#334155", // slate-700
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 12,
  },
  inactiveSectionTitle: {
    color: "#64748b", // slate-500
    fontWeight: "600",
    marginBottom: 12,
  },
  activeCard: {
    backgroundColor: "#1e293b", // slate-800
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155", // slate-700
  },
  inactiveCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)", // slate-800/50
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.5)", // slate-700/50
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfo: {
    flex: 1,
  },
  medName: {
    color: "#ffffff",
    fontWeight: "600",
  },
  medDosage: {
    color: "#94a3b8", // slate-400
    fontSize: 14,
  },
  medInstructions: {
    color: "#64748b", // slate-500
    fontSize: 12,
    marginTop: 4,
  },
  endDate: {
    color: "#64748b", // slate-500
    fontSize: 12,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#334155", // slate-700
  },
  editButtonText: {
    color: "#60a5fa", // blue-400
    fontSize: 12,
    fontWeight: "500",
  },
  stopButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(127, 29, 29, 0.3)", // red-900/30
  },
  stopButtonText: {
    color: "#f87171", // red-400
    fontSize: 12,
    fontWeight: "500",
  },
});
