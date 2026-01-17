import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { formatDate } from "@/utils";
import {
  ENTRY_TYPE_LABELS,
  type MedicalEntryWithDoctor,
  type Medication,
  type LabRequest,
} from "@/types";
import { AnimatedCollapsible, CollapsibleSectionHeader } from "@/components/ui";
import { VitalsDisplay } from "@/components/VitalsDisplay";
import { MedicationCard } from "@/components/MedicationCard";
import { LabRequestCard } from "@/components/LabRequestCard";

interface EntryCardProps {
  entry: MedicalEntryWithDoctor;
  medications: Medication[];
  labs: LabRequest[];
}

export function EntryCard({ entry, medications, labs }: EntryCardProps) {
  const [medsExpanded, setMedsExpanded] = useState(true);
  const [labsExpanded, setLabsExpanded] = useState(true);

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
      {/* Entry Header */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 dark:text-white text-lg">
            {ENTRY_TYPE_LABELS[entry.entryType]}
          </Text>
          <Text className="text-gray-400 text-sm">{entry.doctorName}</Text>
        </View>
        <View className="border border-blue-300 dark:border-blue-500 px-3 py-1 rounded-full">
          <Text className="text-blue-500 text-sm font-medium">
            {formatDate(entry.visitDate)}
          </Text>
        </View>
      </View>

      {/* Vitals */}
      {entry.vitals && (
        <View className="mt-3">
          <VitalsDisplay vitals={entry.vitals} />
        </View>
      )}

      {/* Notes */}
      {entry.notes && (
        <Text className="text-gray-600 dark:text-gray-300 text-sm mt-3">
          {entry.notes}
        </Text>
      )}

      {/* Diagnosis */}
      {entry.diagnosis && (
        <View className="mt-3 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <Text className="text-blue-600 dark:text-blue-400 text-sm">
            <Text className="font-semibold">Diagnosis: </Text>
            {entry.diagnosis}
          </Text>
        </View>
      )}

      {/* Recommendations */}
      {entry.recommendations && (
        <View className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
          <Text className="text-gray-600 dark:text-gray-300 text-sm">
            <Text className="font-semibold">Recommendations: </Text>
            {entry.recommendations}
          </Text>
        </View>
      )}

      {/* Medications */}
      {medications.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <CollapsibleSectionHeader
            title="Medications"
            count={medications.length}
            expanded={medsExpanded}
            onToggle={() => setMedsExpanded(!medsExpanded)}
          />
          <AnimatedCollapsible expanded={medsExpanded}>
            <View className="pt-2">
              {medications.map((med) => (
                <View key={med.id} className="mb-2">
                  <MedicationCard
                    medication={med}
                    variant="inline"
                    showDates={false}
                  />
                </View>
              ))}
            </View>
          </AnimatedCollapsible>
        </View>
      )}

      {/* Labs */}
      {labs.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <CollapsibleSectionHeader
            title="Lab Requests"
            count={labs.length}
            expanded={labsExpanded}
            onToggle={() => setLabsExpanded(!labsExpanded)}
          />
          <AnimatedCollapsible expanded={labsExpanded}>
            <View className="pt-2">
              {labs.map((lab) => (
                <View key={lab.id} className="mb-2">
                  <LabRequestCard lab={lab} variant="inline" showDates={false} />
                </View>
              ))}
            </View>
          </AnimatedCollapsible>
        </View>
      )}

      {/* Follow-up */}
      {entry.followUpDate && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Text className="text-gray-500 text-sm">
            Follow-up: {formatDate(entry.followUpDate)}
          </Text>
        </View>
      )}

      {/* Attachments */}
      {entry.attachments && entry.attachments.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Attachments ({entry.attachments.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {entry.attachments.map((uri, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  // Could open full-screen image viewer here
                }}
                className="mr-2"
              >
                <Image
                  source={{ uri }}
                  className="w-16 h-16 rounded-lg"
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
