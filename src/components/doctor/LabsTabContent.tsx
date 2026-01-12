import { View, Text, StyleSheet } from "react-native";
import { formatDate } from "@/utils";
import type { LabRequest } from "@/types";

interface LabsTabContentProps {
  labs: LabRequest[];
}

export function LabsTabContent({ labs }: LabsTabContentProps) {
  const pendingLabs = labs.filter((l) => l.status === "pending");
  const completedLabs = labs.filter((l) => l.status === "completed");
  const cancelledLabs = labs.filter((l) => l.status === "cancelled");

  if (labs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No lab requests yet</Text>
        <Text style={styles.emptySubtext}>
          Add lab requests when creating an entry
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Pending Labs */}
      {pendingLabs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.pendingTitle}>
            Pending ({pendingLabs.length})
          </Text>
          {pendingLabs.map((lab) => (
            <View key={lab.id} style={styles.pendingCard}>
              <Text style={styles.labDescription}>{lab.description}</Text>
              <Text style={styles.labDate}>
                Requested: {formatDate(lab.requestedDate)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Completed Labs */}
      {completedLabs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.completedTitle}>
            Completed ({completedLabs.length})
          </Text>
          {completedLabs.map((lab) => (
            <View key={lab.id} style={styles.completedCard}>
              <Text style={styles.labDescription}>{lab.description}</Text>
              {lab.results && (
                <Text style={styles.labResults}>{lab.results}</Text>
              )}
              <Text style={styles.labDate}>
                Completed: {formatDate(lab.completedDate || lab.requestedDate)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Cancelled Labs */}
      {cancelledLabs.length > 0 && (
        <View>
          <Text style={styles.cancelledTitle}>
            Cancelled ({cancelledLabs.length})
          </Text>
          {cancelledLabs.map((lab) => (
            <View key={lab.id} style={styles.cancelledCard}>
              <Text style={styles.labDescription}>{lab.description}</Text>
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
  pendingTitle: {
    color: "#fbbf24", // amber-400
    fontWeight: "600",
    marginBottom: 12,
  },
  completedTitle: {
    color: "#4ade80", // green-400
    fontWeight: "600",
    marginBottom: 12,
  },
  cancelledTitle: {
    color: "#64748b", // slate-500
    fontWeight: "600",
    marginBottom: 12,
  },
  pendingCard: {
    backgroundColor: "#1e293b", // slate-800
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)", // amber-500/30
  },
  completedCard: {
    backgroundColor: "#1e293b", // slate-800
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)", // green-500/30
  },
  cancelledCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)", // slate-800/50
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.5)", // slate-700/50
    opacity: 0.6,
  },
  labDescription: {
    color: "#ffffff",
    fontWeight: "600",
  },
  labResults: {
    color: "#cbd5e1", // slate-300
    fontSize: 14,
    marginTop: 8,
  },
  labDate: {
    color: "#94a3b8", // slate-400
    fontSize: 12,
    marginTop: 4,
  },
});
