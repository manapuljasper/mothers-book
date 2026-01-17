import { View, Text, useColorScheme } from "react-native";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleEntryPress = (entryId: string) => {
    router.push({
      pathname: "/(doctor)/booklet/entry/[entryId]",
      params: { entryId, bookletId },
    });
  };

  const timelineLineColor = isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(209, 213, 219, 0.8)";
  const emptyTextColor = isDark ? "#475569" : "#6b7280";
  const endOfRecordsTextColor = isDark ? "#475569" : "#9ca3af";
  const endOfRecordsBgColor = isDark ? "#0f172a" : "#f9fafb";

  if (entries.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text style={{ color: emptyTextColor, fontSize: 14 }}>No records yet</Text>
      </View>
    );
  }

  return (
    <View className="relative">
      {/* Vertical Timeline Line */}
      <View
        className="absolute left-[27px] top-4 bottom-0 w-0.5 z-0"
        style={{ backgroundColor: timelineLineColor }}
      />

      {/* Timeline Entries */}
      {entries.map((entry, index) => {
        const isFirst = index === 0;
        const hasMeds = allMedications.some(
          (m) => m.medicalEntryId === entry.id
        );
        const hasNotes = !!entry.notes && entry.notes.trim().length > 0;

        return (
          <View key={entry.id} className="relative pb-8 z-10">
            <View className="flex-row items-start gap-4">
              {/* Date Badge */}
              <View className="min-w-[56px]">
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
      <View className="items-center mt-2">
        <Text
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: endOfRecordsTextColor,
            backgroundColor: endOfRecordsBgColor,
            paddingHorizontal: 8,
          }}
        >
          No more records
        </Text>
      </View>
    </View>
  );
}
