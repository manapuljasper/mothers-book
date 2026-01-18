import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Plus,
  FileText,
  Pill,
  FlaskConical,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Upload,
  Calendar,
} from "lucide-react-native";
import {
  useCurrentUser,
  useBookletsByMother,
  useEntriesByBooklet,
  useMedicationsByBooklet,
  usePendingLabs,
} from "@/hooks";
import { formatDate, formatRelativeDate, calculateAOGParts } from "@/utils";
import {
  CardPressable,
  EmptyState,
  Button,
  LoadingScreen,
  StatusBadge,
  CollapsibleSectionHeader,
  AnimatedCollapsible,
} from "@/components/ui";
import { LabUploadModal } from "@/components/mother/LabUploadModal";
import type { LabRequestWithDoctor, MotherBooklet, MedicalEntryWithDoctor, Medication } from "@/types";

export default function BookletsDashboardScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const motherProfile = currentUser?.motherProfile;

  const [pastBookletsExpanded, setPastBookletsExpanded] = useState(false);
  const [selectedLab, setSelectedLab] = useState<LabRequestWithDoctor | null>(null);
  const [showLabUploadModal, setShowLabUploadModal] = useState(false);

  const booklets = useBookletsByMother(motherProfile?._id);

  const isLoading = currentUser === undefined || booklets === undefined;

  const activeBooklets = booklets?.filter((b: MotherBooklet) => b.status === "active") ?? [];
  const pastBooklets = booklets?.filter((b: MotherBooklet) => b.status !== "active") ?? [];

  // Get the primary (first) active booklet
  const primaryBooklet = activeBooklets[0];

  // Fetch data for the primary booklet
  const entries = useEntriesByBooklet(primaryBooklet?.id);
  const medications = useMedicationsByBooklet(primaryBooklet?.id);
  const pendingLabs = usePendingLabs(primaryBooklet?.id);

  // Filter active medications
  const activeMedications = medications?.filter((m: Medication) => m.isActive) ?? [];

  // Get recent entries (last 3)
  const recentEntries = entries?.slice(0, 3) ?? [];

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Empty state - no active booklet
  if (!primaryBooklet) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 py-8">
          <EmptyState
            icon={BookOpen}
            title="No Active Pregnancy"
            description="Create a new booklet to start tracking your pregnancy journey"
          />
          <View className="mt-6">
            <Button
              variant="primary"
              icon={Plus}
              onPress={() => router.push("/booklet/new")}
            >
              Create New Booklet
            </Button>
          </View>

          {/* Past Booklets */}
          {pastBooklets.length > 0 && (
            <View className="mt-8">
              <CollapsibleSectionHeader
                title="Past Booklets"
                count={pastBooklets.length}
                expanded={pastBookletsExpanded}
                onToggle={() => setPastBookletsExpanded(!pastBookletsExpanded)}
                size="md"
              />
              <AnimatedCollapsible expanded={pastBookletsExpanded}>
                <View className="mt-4">
                  {pastBooklets.map((booklet: MotherBooklet) => (
                    <CardPressable
                      key={booklet.id}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
                      onPress={() => router.push(`/booklet/${booklet.id}`)}
                    >
                      <Text className="font-medium text-gray-700 dark:text-gray-300">
                        {booklet.label}
                      </Text>
                      {booklet.actualDeliveryDate && (
                        <Text className="text-gray-400 text-sm mt-1">
                          Delivered: {formatDate(booklet.actualDeliveryDate)}
                        </Text>
                      )}
                      <View className="mt-2 self-start">
                        <StatusBadge status={booklet.status} />
                      </View>
                    </CardPressable>
                  ))}
                </View>
              </AnimatedCollapsible>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Calculate stats
  const aog = primaryBooklet.lastMenstrualPeriod
    ? calculateAOGParts(primaryBooklet.lastMenstrualPeriod)
    : null;

  const daysUntilDue = primaryBooklet.expectedDueDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(primaryBooklet.expectedDueDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const entryCount = entries?.length ?? 0;
  const activeMedCount = activeMedications.length;
  const pendingLabCount = pendingLabs?.length ?? 0;

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Active Booklet Card */}
      <View className="px-6 pt-4">
        <CardPressable
          className="bg-pink-500 rounded-2xl p-5 overflow-hidden"
          onPress={() => router.push(`/booklet/${primaryBooklet.id}`)}
        >
          {/* Header */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                {primaryBooklet.label}
              </Text>
              {aog && (
                <Text className="text-white/80 text-sm mt-1">
                  {aog.weeks} weeks {aog.days} days
                </Text>
              )}
            </View>
            <StatusBadge status={primaryBooklet.status} />
          </View>

          {/* Due Date */}
          {primaryBooklet.expectedDueDate && (
            <View className="flex-row items-center mb-4">
              <Calendar size={16} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
              <Text className="text-white/80 text-sm ml-2">
                Due: {formatDate(primaryBooklet.expectedDueDate, "long")}
                {daysUntilDue !== null && ` (${daysUntilDue} days)`}
              </Text>
            </View>
          )}

          {/* Stats Row */}
          <View className="flex-row bg-white/20 rounded-xl p-3 gap-2">
            <View className="flex-1 items-center">
              <Text className="text-white text-xl font-bold">{entryCount}</Text>
              <Text className="text-white/70 text-xs">Visits</Text>
            </View>
            <View className="w-px bg-white/30" />
            <View className="flex-1 items-center">
              <Text className="text-white text-xl font-bold">{activeMedCount}</Text>
              <Text className="text-white/70 text-xs">Meds</Text>
            </View>
            <View className="w-px bg-white/30" />
            <View className="flex-1 items-center">
              <Text
                className={`text-xl font-bold ${pendingLabCount > 0 ? "text-amber-300" : "text-white"}`}
              >
                {pendingLabCount}
              </Text>
              <Text className="text-white/70 text-xs">Labs</Text>
            </View>
          </View>

          {/* View Full Record CTA */}
          <View className="flex-row items-center justify-end mt-4">
            <Text className="text-white/80 text-sm font-medium mr-1">
              View Full Record
            </Text>
            <ChevronRight size={16} color="rgba(255,255,255,0.8)" strokeWidth={2} />
          </View>
        </CardPressable>
      </View>

      {/* Quick Actions */}
      {pendingLabCount > 0 && (
        <View className="px-6 mt-4">
          <Pressable
            className="flex-row items-center bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4"
            onPress={() => {
              if (pendingLabs && pendingLabs.length === 1) {
                setSelectedLab(pendingLabs[0]);
                setShowLabUploadModal(true);
              } else {
                router.push(`/booklet/${primaryBooklet.id}?tab=labs`);
              }
            }}
          >
            <View className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-lg mr-3">
              <Upload size={20} color="#d97706" strokeWidth={1.5} />
            </View>
            <View className="flex-1">
              <Text className="text-amber-900 dark:text-amber-100 font-semibold">
                {pendingLabCount === 1 ? "Upload Lab Results" : `${pendingLabCount} Pending Labs`}
              </Text>
              <Text className="text-amber-700 dark:text-amber-300 text-sm">
                {pendingLabCount === 1 && pendingLabs?.[0]
                  ? pendingLabs[0].description
                  : "Upload your test results"}
              </Text>
            </View>
            <ChevronRight size={20} color="#d97706" strokeWidth={1.5} />
          </Pressable>
        </View>
      )}

      {/* Recent Activity */}
      {recentEntries.length > 0 && (
        <View className="px-6 mt-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Recent Activity
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {recentEntries.map((entry: MedicalEntryWithDoctor, index: number) => (
              <Pressable
                key={entry.id}
                className={`flex-row items-center p-4 ${
                  index !== recentEntries.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
                }`}
                onPress={() => router.push(`/booklet/entry/${entry.id}`)}
              >
                <View className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3">
                  <FileText size={18} color="#6b7280" strokeWidth={1.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {entry.entryType
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {formatRelativeDate(entry.visitDate)}
                    {entry.doctorName && ` • Dr. ${entry.doctorName.split(" ").pop()}`}
                  </Text>
                </View>
                <ChevronRight size={18} color="#9ca3af" strokeWidth={1.5} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Past Booklets Section */}
      {pastBooklets.length > 0 && (
        <View className="px-6 mt-8 mb-4">
          <CollapsibleSectionHeader
            title="Past Booklets"
            count={pastBooklets.length}
            expanded={pastBookletsExpanded}
            onToggle={() => setPastBookletsExpanded(!pastBookletsExpanded)}
            size="md"
          />
          <AnimatedCollapsible expanded={pastBookletsExpanded}>
            <View className="mt-4">
              {pastBooklets.map((booklet: MotherBooklet) => (
                <CardPressable
                  key={booklet.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
                  onPress={() => router.push(`/booklet/${booklet.id}`)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-700 dark:text-gray-300">
                        {booklet.label}
                      </Text>
                      {booklet.actualDeliveryDate && (
                        <Text className="text-gray-400 text-sm mt-1">
                          Delivered: {formatDate(booklet.actualDeliveryDate)}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={18} color="#9ca3af" strokeWidth={1.5} />
                  </View>
                </CardPressable>
              ))}
            </View>
          </AnimatedCollapsible>
        </View>
      )}

      {/* Lab Upload Modal */}
      <LabUploadModal
        visible={showLabUploadModal}
        onClose={() => {
          setShowLabUploadModal(false);
          setSelectedLab(null);
        }}
        lab={selectedLab}
        motherId={motherProfile?._id ?? ""}
        bookletId={primaryBooklet?.id}
      />
    </ScrollView>
  );
}
