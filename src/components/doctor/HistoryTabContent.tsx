import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { TimelineDateBadge, TimelineEntryCard } from "@/components/ui";
import type { MedicalEntryWithDoctor, Medication } from "@/types";

interface HistoryTabContentProps {
  entries: MedicalEntryWithDoctor[];
  allMedications: Medication[];
  bookletId: string;
}

export function HistoryTabContent({
  entries,
  allMedications,
  bookletId,
}: HistoryTabContentProps) {
  const router = useRouter();

  const handleEntryPress = (entryId: string) => {
    router.push({
      pathname: "/(doctor)/booklet/entry/[entryId]",
      params: { entryId, bookletId },
    });
  };

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No records yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vertical Timeline Line */}
      <View style={styles.timelineLine} />

      {/* Timeline Entries */}
      {entries.map((entry, index) => {
        const isFirst = index === 0;
        const hasMeds = allMedications.some(
          (m) => m.medicalEntryId === entry.id
        );
        const hasNotes = !!entry.notes && entry.notes.trim().length > 0;

        return (
          <View key={entry.id} style={styles.entryRow}>
            <View style={styles.entryContent}>
              {/* Date Badge */}
              <View style={styles.dateBadgeContainer}>
                <TimelineDateBadge date={entry.visitDate} isActive={isFirst} />
              </View>

              {/* Entry Card */}
              <TimelineEntryCard
                entryType={entry.entryType}
                doctorName={entry.doctorName}
                visitDate={entry.visitDate}
                vitals={entry.vitals}
                followUpDate={entry.followUpDate}
                hasNotes={hasNotes}
                hasMedications={hasMeds}
                variant={isFirst ? "expanded" : "compact"}
                faded={!isFirst}
                onPress={() => handleEntryPress(entry.id)}
              />
            </View>
          </View>
        );
      })}

      {/* End of Records */}
      <View style={styles.endOfRecords}>
        <Text style={styles.endOfRecordsText}>No more records</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: "#475569",
    fontSize: 14,
  },
  timelineLine: {
    position: "absolute",
    left: 27,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    zIndex: 0,
  },
  entryRow: {
    position: "relative",
    paddingBottom: 32,
    zIndex: 10,
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  dateBadgeContainer: {
    minWidth: 56,
  },
  endOfRecords: {
    alignItems: "center",
    marginTop: 8,
  },
  endOfRecordsText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
  },
});
