import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { formatDate } from "@/utils";
import {
  ENTRY_TYPE_LABELS,
  LAB_STATUS_LABELS,
  type MedicalEntryWithDoctor,
  type Medication,
  type LabRequest,
} from "@/types";
import { AnimatedCollapsible } from "@/components/ui";

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
      {entry.vitals && Object.keys(entry.vitals).length > 0 && (
        <View className="flex-row flex-wrap mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {entry.vitals.bloodPressure && (
            <View className="mr-4 mb-2">
              <Text className="text-gray-400 text-xs">BP</Text>
              <Text className="text-gray-700 dark:text-gray-200 font-medium">
                {entry.vitals.bloodPressure}
              </Text>
            </View>
          )}
          {entry.vitals.weight && (
            <View className="mr-4 mb-2">
              <Text className="text-gray-400 text-xs">Weight</Text>
              <Text className="text-gray-700 dark:text-gray-200 font-medium">
                {entry.vitals.weight} kg
              </Text>
            </View>
          )}
          {entry.vitals.fetalHeartRate && (
            <View className="mr-4 mb-2">
              <Text className="text-gray-400 text-xs">FHR</Text>
              <Text className="text-gray-700 dark:text-gray-200 font-medium">
                {entry.vitals.fetalHeartRate} bpm
              </Text>
            </View>
          )}
          {entry.vitals.fundalHeight && (
            <View className="mr-4 mb-2">
              <Text className="text-gray-400 text-xs">Fundal Height</Text>
              <Text className="text-gray-700 dark:text-gray-200 font-medium">
                {entry.vitals.fundalHeight} cm
              </Text>
            </View>
          )}
          {entry.vitals.aog && (
            <View className="mr-4 mb-2">
              <Text className="text-gray-400 text-xs">AOG</Text>
              <Text className="text-gray-700 dark:text-gray-200 font-medium">
                {entry.vitals.aog}
              </Text>
            </View>
          )}
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
          <Pressable
            onPress={() => setMedsExpanded(!medsExpanded)}
            className="flex-row justify-between items-center"
          >
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Medications ({medications.length})
            </Text>
            {medsExpanded ? (
              <ChevronUp size={16} color="#9ca3af" strokeWidth={1.5} />
            ) : (
              <ChevronDown size={16} color="#9ca3af" strokeWidth={1.5} />
            )}
          </Pressable>
          <AnimatedCollapsible expanded={medsExpanded}>
            <View className="pt-2">
              {medications.map((med) => (
                <View
                  key={med.id}
                  className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 mb-2"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {med.name}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {med.dosage} • {med.frequencyPerDay}x daily
                      </Text>
                    </View>
                    <View
                      className={`px-2 py-1 rounded-full border ${
                        med.isActive
                          ? "border-green-400"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          med.isActive
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {med.isActive ? "Active" : "Done"}
                      </Text>
                    </View>
                  </View>
                  {med.instructions && (
                    <Text className="text-gray-400 text-xs mt-1">
                      {med.instructions}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </AnimatedCollapsible>
        </View>
      )}

      {/* Labs */}
      {labs.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Pressable
            onPress={() => setLabsExpanded(!labsExpanded)}
            className="flex-row justify-between items-center"
          >
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Lab Requests ({labs.length})
            </Text>
            {labsExpanded ? (
              <ChevronUp size={16} color="#9ca3af" strokeWidth={1.5} />
            ) : (
              <ChevronDown size={16} color="#9ca3af" strokeWidth={1.5} />
            )}
          </Pressable>
          <AnimatedCollapsible expanded={labsExpanded}>
            <View className="pt-2">
              {labs.map((lab) => (
                <View
                  key={lab.id}
                  className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 mb-2"
                >
                  <View className="flex-row justify-between items-start">
                    <Text className="font-medium text-gray-900 dark:text-white flex-1">
                      {lab.description}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full border ${
                        lab.status === "completed"
                          ? "border-green-400"
                          : lab.status === "pending"
                          ? "border-amber-400"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          lab.status === "completed"
                            ? "text-green-600 dark:text-green-400"
                            : lab.status === "pending"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {LAB_STATUS_LABELS[lab.status]}
                      </Text>
                    </View>
                  </View>
                  {lab.results && (
                    <Text className="text-green-600 dark:text-green-400 text-sm mt-2">
                      <Text className="font-medium">Results: </Text>
                      {lab.results}
                    </Text>
                  )}
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
