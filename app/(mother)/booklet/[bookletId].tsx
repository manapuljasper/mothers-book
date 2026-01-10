import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react-native";
import {
  useBookletStore,
  useMedicalStore,
  useMedicationStore,
} from "../../../src/stores";
import { formatDate } from "../../../src/utils";
import { ENTRY_TYPE_LABELS, LAB_STATUS_LABELS } from "../../../src/types";
import { CardPressable, AnimatedCollapsible } from "../../../src/components/ui";

export default function BookletDetailScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();

  const { getBookletById, getAccessibleDoctors } = useBookletStore();
  const { getEntriesByBooklet, getLabsByEntry } = useMedicalStore();
  const { getMedicationsByBooklet } = useMedicationStore();

  const booklet = getBookletById(bookletId);
  const entries = getEntriesByBooklet(bookletId);
  const allMedications = getMedicationsByBooklet(bookletId);
  const doctors = getAccessibleDoctors(bookletId);

  // Get sorted unique dates from entries (as ISO date strings)
  const visitDates = useMemo(() => {
    const dateStrings = entries.map((e) => {
      const d = e.visitDate;
      return typeof d === "string" ? d : new Date(d).toISOString().split("T")[0];
    });
    return [...new Set(dateStrings)].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [entries]);

  // Selected date state - default to most recent
  const [selectedDate, setSelectedDate] = useState<string | null>(
    visitDates[0] || null
  );

  // Collapsible sections state
  const [medsExpanded, setMedsExpanded] = useState(true);
  const [labsExpanded, setLabsExpanded] = useState(true);

  // Get entry for selected date
  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null;
    return (
      entries.find((e) => {
        const d = e.visitDate;
        const dateStr =
          typeof d === "string" ? d : new Date(d).toISOString().split("T")[0];
        return dateStr === selectedDate;
      }) || null
    );
  }, [entries, selectedDate]);

  if (!booklet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Booklet not found</Text>
      </SafeAreaView>
    );
  }

  const activeMeds = allMedications.filter((m) => m.isActive);

  // Helper to get medications for a specific entry
  const getMedsForEntry = (entryId: string) => {
    return allMedications.filter((m) => m.medicalEntryId === entryId);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-pink-500 px-6 py-6">
          <CardPressable onPress={() => router.back()} className="flex-row items-center mb-3">
            <ChevronLeft size={20} color="#fbcfe8" strokeWidth={1.5} />
            <Text className="text-pink-200 ml-1">Back</Text>
          </CardPressable>
          <Text className="text-white text-2xl font-bold">{booklet.label}</Text>
          <View className="flex-row items-center mt-2">
            <View
              className={`px-2 py-1 rounded-full border ${
                booklet.status === "active" ? "border-white/50" : "border-white/30"
              }`}
            >
              <Text className="text-white text-xs font-medium">
                {booklet.status}
              </Text>
            </View>
            {booklet.expectedDueDate && (
              <Text className="text-pink-200 ml-3">
                Due: {formatDate(booklet.expectedDueDate)}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row px-4 -mt-4">
          <View className="flex-1 bg-white rounded-xl p-4 mx-1 border border-gray-100">
            <Text className="text-2xl font-bold text-pink-500">
              {entries.length}
            </Text>
            <Text className="text-gray-400 text-xs">Visits</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 mx-1 border border-gray-100">
            <Text className="text-2xl font-bold text-blue-500">
              {activeMeds.length}
            </Text>
            <Text className="text-gray-400 text-xs">Active Meds</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 mx-1 border border-gray-100">
            <Text className="text-2xl font-bold text-green-500">
              {doctors.length}
            </Text>
            <Text className="text-gray-400 text-xs">Doctors</Text>
          </View>
        </View>

        {/* Doctors with Access */}
        {doctors.length > 0 && (
          <View className="px-6 mt-8">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              My Doctors
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {doctors.map((doctor) => (
                <View
                  key={doctor.id}
                  className="bg-white rounded-xl p-4 mr-3 border border-gray-100 min-w-[140px]"
                >
                  <Text className="font-medium text-gray-900">
                    {doctor.fullName}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {doctor.specialization || "OB-GYN"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Date Picker for Visits */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Visit History
          </Text>
          {visitDates.length === 0 ? (
            <View className="bg-white rounded-xl p-6 border border-gray-100">
              <Text className="text-gray-400 text-center">No visits yet</Text>
            </View>
          ) : (
            <>
              {/* Horizontal Date Selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                {visitDates.map((date) => {
                  const isSelected = date === selectedDate;
                  const dateObj = new Date(date);
                  const day = dateObj.getDate();
                  const month = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                  });

                  return (
                    <Pressable
                      key={date}
                      onPress={() => setSelectedDate(date)}
                      className={`items-center justify-center px-4 py-3 mr-2 rounded-xl border ${
                        isSelected ? "bg-pink-500 border-pink-500" : "bg-white border-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          isSelected ? "text-pink-200" : "text-gray-400"
                        }`}
                      >
                        {month}
                      </Text>
                      <Text
                        className={`text-xl font-bold ${
                          isSelected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Selected Entry Display */}
              {selectedEntry && (
                <View className="bg-white rounded-xl p-5 mb-8 border border-gray-100">
                  {/* Entry Header */}
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 text-lg">
                        {ENTRY_TYPE_LABELS[selectedEntry.entryType]}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {selectedEntry.doctorName}
                      </Text>
                    </View>
                    <View className="border border-pink-300 px-3 py-1 rounded-full">
                      <Text className="text-pink-500 text-sm font-medium">
                        {formatDate(selectedEntry.visitDate)}
                      </Text>
                    </View>
                  </View>

                  {/* Vitals */}
                  {selectedEntry.vitals &&
                    Object.keys(selectedEntry.vitals).length > 0 && (
                      <View className="flex-row flex-wrap mt-3 pt-3 border-t border-gray-100">
                        {selectedEntry.vitals.bloodPressure && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">BP</Text>
                            <Text className="text-gray-700 font-medium">
                              {selectedEntry.vitals.bloodPressure}
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.weight && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">Weight</Text>
                            <Text className="text-gray-700 font-medium">
                              {selectedEntry.vitals.weight} kg
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.fetalHeartRate && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">FHR</Text>
                            <Text className="text-gray-700 font-medium">
                              {selectedEntry.vitals.fetalHeartRate} bpm
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.fundalHeight && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">
                              Fundal Height
                            </Text>
                            <Text className="text-gray-700 font-medium">
                              {selectedEntry.vitals.fundalHeight} cm
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.aog && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">AOG</Text>
                            <Text className="text-gray-700 font-medium">
                              {selectedEntry.vitals.aog}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                  {/* Notes */}
                  {selectedEntry.notes && (
                    <Text className="text-gray-600 text-sm mt-3">
                      {selectedEntry.notes}
                    </Text>
                  )}

                  {/* Diagnosis */}
                  {selectedEntry.diagnosis && (
                    <View className="mt-3 border border-blue-200 rounded-lg p-3">
                      <Text className="text-blue-600 text-sm">
                        <Text className="font-semibold">Diagnosis: </Text>
                        {selectedEntry.diagnosis}
                      </Text>
                    </View>
                  )}

                  {/* Recommendations */}
                  {selectedEntry.recommendations && (
                    <View className="mt-2 border border-gray-200 rounded-lg p-3">
                      <Text className="text-gray-600 text-sm">
                        <Text className="font-semibold">Recommendations: </Text>
                        {selectedEntry.recommendations}
                      </Text>
                    </View>
                  )}

                  {/* Medications prescribed in this visit */}
                  {getMedsForEntry(selectedEntry.id).length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      <Pressable
                        onPress={() => setMedsExpanded(!medsExpanded)}
                        className="flex-row justify-between items-center"
                      >
                        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Medications ({getMedsForEntry(selectedEntry.id).length})
                        </Text>
                        {medsExpanded ? (
                          <ChevronUp size={16} color="#9ca3af" strokeWidth={1.5} />
                        ) : (
                          <ChevronDown size={16} color="#9ca3af" strokeWidth={1.5} />
                        )}
                      </Pressable>
                      <AnimatedCollapsible expanded={medsExpanded}>
                        <View className="pt-2">
                          {getMedsForEntry(selectedEntry.id).map((med) => (
                            <View
                              key={med.id}
                              className="border border-gray-100 rounded-lg p-3 mb-2"
                            >
                              <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                  <Text className="font-medium text-gray-900">
                                    {med.name}
                                  </Text>
                                  <Text className="text-gray-400 text-sm">
                                    {med.dosage} • {med.frequencyPerDay}x daily
                                  </Text>
                                </View>
                                <View
                                  className={`px-2 py-1 rounded-full border ${
                                    med.isActive ? "border-green-400" : "border-gray-300"
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      med.isActive
                                        ? "text-green-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {med.isActive ? "Active" : "Done"}
                                  </Text>
                                </View>
                              </View>
                              <Text className="text-gray-400 text-xs mt-1">
                                {med.instructions}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </AnimatedCollapsible>
                    </View>
                  )}

                  {/* Lab requests from this visit */}
                  {getLabsByEntry(selectedEntry.id).length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      <Pressable
                        onPress={() => setLabsExpanded(!labsExpanded)}
                        className="flex-row justify-between items-center"
                      >
                        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Lab Requests ({getLabsByEntry(selectedEntry.id).length})
                        </Text>
                        {labsExpanded ? (
                          <ChevronUp size={16} color="#9ca3af" strokeWidth={1.5} />
                        ) : (
                          <ChevronDown size={16} color="#9ca3af" strokeWidth={1.5} />
                        )}
                      </Pressable>
                      <AnimatedCollapsible expanded={labsExpanded}>
                        <View className="pt-2">
                          {getLabsByEntry(selectedEntry.id).map((lab) => (
                            <View
                              key={lab.id}
                              className="border border-gray-100 rounded-lg p-3 mb-2"
                            >
                              <View className="flex-row justify-between items-start">
                                <Text className="font-medium text-gray-900 flex-1">
                                  {lab.description}
                                </Text>
                                <View
                                  className={`px-2 py-1 rounded-full border ${
                                    lab.status === "completed"
                                      ? "border-green-400"
                                      : lab.status === "pending"
                                      ? "border-amber-400"
                                      : "border-gray-300"
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      lab.status === "completed"
                                        ? "text-green-600"
                                        : lab.status === "pending"
                                        ? "text-amber-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {LAB_STATUS_LABELS[lab.status]}
                                  </Text>
                                </View>
                              </View>
                              {lab.results && (
                                <Text className="text-green-600 text-sm mt-2">
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

                  {/* Follow-up date */}
                  {selectedEntry.followUpDate && (
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      <Text className="text-gray-500 text-sm">
                        Follow-up: {formatDate(selectedEntry.followUpDate)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
