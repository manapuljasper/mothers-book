import { View, Text } from "react-native";
import { TimelineDateBadge, TimelineEntryCard } from "@/components/ui";
import type { MedicalEntryWithDoctor, Medication } from "@/types";

interface HistoryTabContentProps {
  entries: MedicalEntryWithDoctor[];
  allMedications: Medication[];
  onEntryPress: (entryId: string) => void;
}

export function HistoryTabContent({
  entries,
  allMedications,
  onEntryPress,
}: HistoryTabContentProps) {
  if (entries.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-slate-600 text-sm">No records yet</Text>
      </View>
    );
  }

  return (
    <View className="relative">
      {/* Vertical Timeline Line */}
      <View
        className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-slate-700/50"
        style={{ zIndex: 0 }}
      />

      {/* Timeline Entries */}
      {entries.map((entry, index) => {
        const isFirst = index === 0;
        const hasMeds = allMedications.some(
          (m) => m.medicalEntryId === entry.id
        );
        const hasNotes = !!entry.notes && entry.notes.trim().length > 0;

        return (
          <View key={entry.id} className="relative pb-8" style={{ zIndex: 10 }}>
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
                onPress={() => onEntryPress(entry.id)}
              />
            </View>
          </View>
        );
      })}

      {/* End of Records */}
      <View className="items-center mt-2">
        <Text className="text-xs text-slate-600 font-medium bg-slate-900 px-2">
          No more records
        </Text>
      </View>
    </View>
  );
}
