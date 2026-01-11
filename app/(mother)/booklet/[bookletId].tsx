import { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, ChevronDown, ChevronUp, FlaskConical, Paperclip, Pill } from "lucide-react-native";
import {
  useBookletById,
  useBookletDoctors,
  useEntriesByBooklet,
  useLabsByBooklet,
  useMedicationsByBooklet,
  usePendingLabs,
} from "@/hooks";
import { formatDate } from "@/utils";
import { ENTRY_TYPE_LABELS, LAB_STATUS_LABELS } from "@/types";
import { CardPressable, AnimatedCollapsible, StatCard } from "@/components/ui";

export default function BookletDetailScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: booklet, isLoading: bookletLoading } = useBookletById(bookletId);
  const { data: doctors = [] } = useBookletDoctors(bookletId);
  const { data: entries = [], isLoading: entriesLoading } = useEntriesByBooklet(bookletId);
  const { data: allMedications = [], isLoading: medsLoading } = useMedicationsByBooklet(bookletId);
  const { data: allLabs = [] } = useLabsByBooklet(bookletId);
  const { data: pendingLabs = [] } = usePendingLabs(bookletId);

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Set selected date to most recent when entries load
  useEffect(() => {
    if (visitDates.length > 0 && selectedDate === null) {
      setSelectedDate(visitDates[0]);
    }
  }, [visitDates, selectedDate]);

  // Collapsible sections state - default to collapsed
  const [medsExpanded, setMedsExpanded] = useState(true);
  const [labsExpanded, setLabsExpanded] = useState(true);
  const [pendingLabsExpanded, setPendingLabsExpanded] = useState(false);
  const [activeMedsExpanded, setActiveMedsExpanded] = useState(false);

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

  const isLoading = bookletLoading || entriesLoading || medsLoading;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
      </SafeAreaView>
    );
  }

  if (!booklet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">Booklet not found</Text>
      </SafeAreaView>
    );
  }

  const activeMeds = allMedications.filter((m) => m.isActive);

  // Helper to get labs requested on a specific date
  const getLabsForVisitDate = (visitDate: string) => {
    return allLabs.filter((lab) => {
      const labDate = new Date(lab.requestedDate).toISOString().split("T")[0];
      return labDate === visitDate;
    });
  };

  // Helper to get medications active during a specific date
  const getMedsActiveOnDate = (visitDate: string) => {
    const date = new Date(visitDate);
    return allMedications.filter((med) => {
      const startDate = new Date(med.startDate);
      const endDate = med.endDate ? new Date(med.endDate) : null;
      // Active if: started before/on this date AND (no end date OR end date on/after this date)
      return startDate <= date && (!endDate || endDate >= date);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-500" edges={[]}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="bg-pink-500 px-6 py-6" style={{ paddingTop: insets.top }}>
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

        {/* Quick Stats - tappable to navigate to history */}
        <View className="flex-row px-4 -mt-4">
          <StatCard value={entries.length} label="Visits" color="pink" size="sm" />
          <StatCard
            value={allMedications.length}
            label="Medications"
            color="blue"
            size="sm"
            onPress={() => router.push(`/(mother)/booklet/${bookletId}/history`)}
          />
          <StatCard
            value={allLabs.length}
            label="Labs"
            color="purple"
            size="sm"
            onPress={() => router.push(`/(mother)/booklet/${bookletId}/labs`)}
          />
        </View>

        {/* Doctors with Access */}
        {doctors.length > 0 && (
          <View className="px-6 mt-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              My Doctors
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {doctors.map((doctor) => (
                <View
                  key={doctor.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 mr-3 border border-gray-100 dark:border-gray-700 min-w-[140px]"
                >
                  <Text className="font-medium text-gray-900 dark:text-white">
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

        {/* Pending Labs Section - collapsed by default */}
        <View className="px-6 mt-6">
          <Pressable
            onPress={() => setPendingLabsExpanded(!pendingLabsExpanded)}
            className="flex-row justify-between items-center mb-3"
          >
            <View className="flex-row items-center">
              <FlaskConical size={18} color="#f59e0b" strokeWidth={1.5} />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                Pending Labs ({pendingLabs.length})
              </Text>
            </View>
            {pendingLabsExpanded ? (
              <ChevronUp size={20} color="#9ca3af" strokeWidth={1.5} />
            ) : (
              <ChevronDown size={20} color="#9ca3af" strokeWidth={1.5} />
            )}
          </Pressable>
          <AnimatedCollapsible expanded={pendingLabsExpanded}>
            <View>
              {pendingLabs.length === 0 ? (
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <Text className="text-gray-400 text-center text-sm">No pending labs</Text>
                </View>
              ) : (
                pendingLabs.map((lab) => (
                  <View
                    key={lab.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900 dark:text-white">
                          {lab.description}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          Requested: {formatDate(lab.requestedDate)}
                        </Text>
                        {lab.notes && (
                          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                            {lab.notes}
                          </Text>
                        )}
                      </View>
                      <View className="px-2 py-1 rounded-full border border-amber-400">
                        <Text className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          {LAB_STATUS_LABELS[lab.status]}
                        </Text>
                      </View>
                    </View>
                    {/* Add Attachment Button (UI only) */}
                    <Pressable
                      onPress={() => {
                        // Attachment functionality not implemented yet
                      }}
                      className="flex-row items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"
                    >
                      <Paperclip size={14} color="#ec4899" strokeWidth={1.5} />
                      <Text className="text-pink-500 text-sm font-medium ml-2">
                        Add Attachment
                      </Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </AnimatedCollapsible>
        </View>

        {/* Active Medications Section - collapsed by default */}
        <View className="px-6 mt-4">
          <Pressable
            onPress={() => setActiveMedsExpanded(!activeMedsExpanded)}
            className="flex-row justify-between items-center mb-3"
          >
            <View className="flex-row items-center">
              <Pill size={18} color="#3b82f6" strokeWidth={1.5} />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                Active Medications ({activeMeds.length})
              </Text>
            </View>
            {activeMedsExpanded ? (
              <ChevronUp size={20} color="#9ca3af" strokeWidth={1.5} />
            ) : (
              <ChevronDown size={20} color="#9ca3af" strokeWidth={1.5} />
            )}
          </Pressable>
          <AnimatedCollapsible expanded={activeMedsExpanded}>
            <View>
              {activeMeds.length === 0 ? (
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <Text className="text-gray-400 text-center text-sm">No active medications</Text>
                </View>
              ) : (
                activeMeds.map((med) => (
                  <View
                    key={med.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
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
                      <View className="px-2 py-1 rounded-full border border-green-400">
                        <Text className="text-xs font-medium text-green-600 dark:text-green-400">
                          Active
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row mt-2 flex-wrap">
                      <Text className="text-gray-400 text-xs mr-3">
                        Started: {formatDate(med.startDate)}
                      </Text>
                      {med.endDate && (
                        <Text className="text-gray-400 text-xs">
                          Until: {formatDate(med.endDate)}
                        </Text>
                      )}
                    </View>
                    {med.instructions && (
                      <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        {med.instructions}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </AnimatedCollapsible>
        </View>

        {/* Date Picker for Visits */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Visit History
          </Text>
          {visitDates.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
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
                        isSelected
                          ? "bg-pink-500 border-pink-500"
                          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
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
                          isSelected ? "text-white" : "text-gray-700 dark:text-gray-200"
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
                <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
                  {/* Entry Header */}
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 dark:text-white text-lg">
                        {ENTRY_TYPE_LABELS[selectedEntry.entryType]}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {selectedEntry.doctorName}
                      </Text>
                    </View>
                    <View className="border border-pink-300 dark:border-pink-500 px-3 py-1 rounded-full">
                      <Text className="text-pink-500 text-sm font-medium">
                        {formatDate(selectedEntry.visitDate)}
                      </Text>
                    </View>
                  </View>

                  {/* Vitals */}
                  {selectedEntry.vitals &&
                    Object.keys(selectedEntry.vitals).length > 0 && (
                      <View className="flex-row flex-wrap mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {selectedEntry.vitals.bloodPressure && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">BP</Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.bloodPressure}
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.weight && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">Weight</Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.weight} kg
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.fetalHeartRate && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">FHR</Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.fetalHeartRate} bpm
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.fundalHeight && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">
                              Fundal Height
                            </Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.fundalHeight} cm
                            </Text>
                          </View>
                        )}
                        {selectedEntry.vitals.aog && (
                          <View className="mr-4 mb-2">
                            <Text className="text-gray-400 text-xs">AOG</Text>
                            <Text className="text-gray-700 dark:text-gray-200 font-medium">
                              {selectedEntry.vitals.aog}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                  {/* Notes */}
                  {selectedEntry.notes && (
                    <Text className="text-gray-600 dark:text-gray-300 text-sm mt-3">
                      {selectedEntry.notes}
                    </Text>
                  )}

                  {/* Diagnosis */}
                  {selectedEntry.diagnosis && (
                    <View className="mt-3 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                      <Text className="text-blue-600 dark:text-blue-400 text-sm">
                        <Text className="font-semibold">Diagnosis: </Text>
                        {selectedEntry.diagnosis}
                      </Text>
                    </View>
                  )}

                  {/* Recommendations */}
                  {selectedEntry.recommendations && (
                    <View className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <Text className="text-gray-600 dark:text-gray-300 text-sm">
                        <Text className="font-semibold">Recommendations: </Text>
                        {selectedEntry.recommendations}
                      </Text>
                    </View>
                  )}

                  {/* Medications active during this visit */}
                  {selectedDate && getMedsActiveOnDate(selectedDate).length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Pressable
                        onPress={() => setMedsExpanded(!medsExpanded)}
                        className="flex-row justify-between items-center"
                      >
                        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Active Medications ({getMedsActiveOnDate(selectedDate).length})
                        </Text>
                        {medsExpanded ? (
                          <ChevronUp size={16} color="#9ca3af" strokeWidth={1.5} />
                        ) : (
                          <ChevronDown size={16} color="#9ca3af" strokeWidth={1.5} />
                        )}
                      </Pressable>
                      <AnimatedCollapsible expanded={medsExpanded}>
                        <View className="pt-2">
                          {getMedsActiveOnDate(selectedDate).map((med) => (
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
                              </View>
                              <View className="flex-row mt-1 flex-wrap">
                                <Text className="text-blue-500 dark:text-blue-400 text-xs mr-3">
                                  Prescribed: {formatDate(med.startDate)}
                                </Text>
                                {med.endDate && (
                                  <Text className="text-gray-400 text-xs">
                                    Until: {formatDate(med.endDate)}
                                  </Text>
                                )}
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

                  {/* Lab requests from this visit date */}
                  {selectedDate && getLabsForVisitDate(selectedDate).length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Pressable
                        onPress={() => setLabsExpanded(!labsExpanded)}
                        className="flex-row justify-between items-center"
                      >
                        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Lab Requests ({getLabsForVisitDate(selectedDate).length})
                        </Text>
                        {labsExpanded ? (
                          <ChevronUp size={16} color="#9ca3af" strokeWidth={1.5} />
                        ) : (
                          <ChevronDown size={16} color="#9ca3af" strokeWidth={1.5} />
                        )}
                      </Pressable>
                      <AnimatedCollapsible expanded={labsExpanded}>
                        <View className="pt-2">
                          {getLabsForVisitDate(selectedDate).map((lab) => (
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

                  {/* Follow-up date */}
                  {selectedEntry.followUpDate && (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
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
