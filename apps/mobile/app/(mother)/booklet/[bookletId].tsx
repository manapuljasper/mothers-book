import { useState, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, Baby, Users } from "lucide-react-native";
import {
  useBookletById,
  useBookletDoctors,
  useEntriesByBooklet,
  useLabsByBooklet,
  useMedicationsByBooklet,
} from "@/hooks";
import { formatDate, calculateAOG } from "@/utils";
import {
  CardPressable,
  StatusBadge,
  AOGBadge,
  BookletTabBar,
  MotherBookletDetailSkeleton,
  type BookletTab,
} from "@/components/ui";
import {
  HistoryTabContent,
  MedsTabContent,
  LabsTabContent,
} from "@/components/doctor";

export default function MotherBookletDetailScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Convex query hooks
  const booklet = useBookletById(bookletId);
  const doctors = useBookletDoctors(bookletId) ?? [];
  const entries = useEntriesByBooklet(bookletId) ?? [];
  const allMedications = useMedicationsByBooklet(bookletId) ?? [];
  const allLabs = useLabsByBooklet(bookletId) ?? [];

  // Local state
  const [activeTab, setActiveTab] = useState<BookletTab>("history");

  const isLoading =
    booklet === undefined ||
    entries === undefined ||
    allMedications === undefined;

  // Sorted entries by date (most recent first)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = new Date(a.visitDate).getTime();
      const dateB = new Date(b.visitDate).getTime();
      return dateB - dateA;
    });
  }, [entries]);

  // Calculate AOG from booklet's LMP
  const currentAOG = useMemo(() => {
    if (!booklet?.lastMenstrualPeriod) return null;
    return calculateAOG(booklet.lastMenstrualPeriod);
  }, [booklet?.lastMenstrualPeriod]);

  const activeMeds = allMedications.filter((m) => m.isActive);

  // Loading state
  if (isLoading) {
    return <MotherBookletDetailSkeleton />;
  }

  if (!booklet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-400">Booklet not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-pink-500" edges={[]}>
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-slate-900"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Curved Header - Pink Theme */}
        <View
          className="bg-pink-500 px-5 pb-12 relative overflow-hidden"
          style={{
            paddingTop: insets.top + 8,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          {/* Decorative circle */}
          <View
            className="absolute -top-32 -right-16 w-64 h-64 bg-white/5 rounded-full"
            style={{ transform: [{ scale: 1.5 }] }}
          />

          {/* Back button */}
          <CardPressable
            onPress={() => router.back()}
            className="flex-row items-center mb-6 opacity-90"
          >
            <ChevronLeft size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-white text-sm font-semibold tracking-wide ml-1">
              Back
            </Text>
          </CardPressable>

          {/* Title and AOG */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white tracking-tight">
                {booklet.label}
              </Text>
              {booklet.expectedDueDate && (
                <View className="flex-row items-center gap-2 mt-1">
                  <Baby size={14} color="#fbcfe8" strokeWidth={1.5} />
                  <Text className="text-pink-100 font-medium">
                    Due: {formatDate(booklet.expectedDueDate)}
                  </Text>
                </View>
              )}
            </View>
            {currentAOG && <AOGBadge aog={currentAOG} size="md" />}
          </View>

          {/* Status and doctors count */}
          <View className="flex-row items-center gap-3 mt-5">
            <StatusBadge status={booklet.status} showDot glassmorphism />
            {doctors.length > 0 && (
              <View className="bg-pink-600/30 px-3 py-1 rounded-full border border-white/10 flex-row items-center gap-1.5">
                <Users size={12} color="#fce7f3" strokeWidth={2} />
                <Text className="text-pink-50 text-xs font-medium">
                  {doctors.length} Doctor{doctors.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="px-5 -mt-8 relative z-20 pb-24">
          {/* Tab Bar */}
          <View className="mb-6">
            <BookletTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </View>

          {/* My Doctors Section - show at top of history tab */}
          {activeTab === "history" && doctors.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                My Doctors
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {doctors.map((doctor) => (
                  <CardPressable
                    key={doctor.id}
                    onPress={() => router.push(`/(mother)/view-doctor/${doctor.id}`)}
                    className="bg-slate-800 rounded-xl p-4 mr-3 border border-slate-700 min-w-[140px]"
                  >
                    <Text className="font-medium text-white">
                      {doctor.fullName}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-1">
                      {doctor.specialization || "OB-GYN"}
                    </Text>
                  </CardPressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <HistoryTabContent
              entries={sortedEntries}
              allMedications={allMedications}
              bookletId={bookletId}
              entryRoute="mother"
            />
          )}

          {/* Meds Tab - read-only mode */}
          {activeTab === "meds" && (
            <MedsTabContent
              medications={allMedications}
              activeMeds={activeMeds}
              readOnly
            />
          )}

          {/* Labs Tab */}
          {activeTab === "labs" && <LabsTabContent labs={allLabs} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
