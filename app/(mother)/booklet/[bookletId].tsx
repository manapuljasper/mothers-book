import { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
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
import { formatDate, getDateString } from "@/utils";
import { ENTRY_TYPE_LABELS } from "@/types";
import {
  CardPressable,
  AnimatedCollapsible,
  StatCard,
  LoadingScreen,
  StatusBadge,
  CollapsibleSectionHeader,
} from "@/components/ui";
import { VitalsDisplay, MedicationCard, LabRequestCard } from "@/components";

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
    return <LoadingScreen color="#ec4899" />;
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
          <View className="mb-3">
            <CollapsibleSectionHeader
              title="Pending Labs"
              count={pendingLabs.length}
              expanded={pendingLabsExpanded}
              onToggle={() => setPendingLabsExpanded(!pendingLabsExpanded)}
              icon={FlaskConical}
              size="md"
            />
          </View>
          <AnimatedCollapsible expanded={pendingLabsExpanded}>
            <View>
              {pendingLabs.length === 0 ? (
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <Text className="text-gray-400 text-center text-sm">No pending labs</Text>
                </View>
              ) : (
                pendingLabs.map((lab) => (
                  <View key={lab.id} className="mb-3">
                    <LabRequestCard
                      lab={lab}
                      action={
                        <Pressable
                          onPress={() => {
                            // Attachment functionality not implemented yet
                          }}
                          className="flex-row items-center"
                        >
                          <Paperclip size={14} color="#ec4899" strokeWidth={1.5} />
                          <Text className="text-pink-500 text-sm font-medium ml-2">
                            Add Attachment
                          </Text>
                        </Pressable>
                      }
                    />
                  </View>
                ))
              )}
            </View>
          </AnimatedCollapsible>
        </View>

        {/* Active Medications Section - collapsed by default */}
        <View className="px-6 mt-4">
          <View className="mb-3">
            <CollapsibleSectionHeader
              title="Active Medications"
              count={activeMeds.length}
              expanded={activeMedsExpanded}
              onToggle={() => setActiveMedsExpanded(!activeMedsExpanded)}
              icon={Pill}
              size="md"
            />
          </View>
          <AnimatedCollapsible expanded={activeMedsExpanded}>
            <View>
              {activeMeds.length === 0 ? (
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <Text className="text-gray-400 text-center text-sm">No active medications</Text>
                </View>
              ) : (
                activeMeds.map((med) => (
                  <View key={med.id} className="mb-3">
                    <MedicationCard medication={med} />
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
                  {selectedEntry.vitals && (
                    <View className="mt-3">
                      <VitalsDisplay vitals={selectedEntry.vitals} />
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
                      <CollapsibleSectionHeader
                        title="Active Medications"
                        count={getMedsActiveOnDate(selectedDate).length}
                        expanded={medsExpanded}
                        onToggle={() => setMedsExpanded(!medsExpanded)}
                      />
                      <AnimatedCollapsible expanded={medsExpanded}>
                        <View className="pt-2">
                          {getMedsActiveOnDate(selectedDate).map((med) => (
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

                  {/* Lab requests from this visit date */}
                  {selectedDate && getLabsForVisitDate(selectedDate).length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <CollapsibleSectionHeader
                        title="Lab Requests"
                        count={getLabsForVisitDate(selectedDate).length}
                        expanded={labsExpanded}
                        onToggle={() => setLabsExpanded(!labsExpanded)}
                      />
                      <AnimatedCollapsible expanded={labsExpanded}>
                        <View className="pt-2">
                          {getLabsForVisitDate(selectedDate).map((lab) => (
                            <View key={lab.id} className="mb-2">
                              <LabRequestCard
                                lab={lab}
                                variant="inline"
                                showDates={false}
                              />
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
