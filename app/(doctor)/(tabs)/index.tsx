import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { QrCode, Calendar, Users } from "lucide-react-native";
import {
  useCurrentUser,
  useBookletsByDoctor,
  useEntriesByDoctorToday,
  useResponsive,
  type EntryWithPatientDetails,
} from "../../../src/hooks";
import { formatRelativeDate, isToday } from "../../../src/utils";
import {
  CardPressable,
  EmptyState,
  DoctorDashboardSkeleton,
} from "../../../src/components/ui";
import { ResponsiveGrid } from "../../../src/components/layout";

export default function DoctorDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUser = useCurrentUser();
  const doctorProfile = currentUser?.doctorProfile;
  const { isTablet, select } = useResponsive();

  const patientBooklets = useBookletsByDoctor(doctorProfile?._id) ?? [];
  const todayEntries = useEntriesByDoctorToday(doctorProfile?._id) ?? [];

  const [seenTodayExpanded, setSeenTodayExpanded] = useState(true);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] =
    useState<EntryWithPatientDetails | null>(null);

  // Filter booklets with appointments today
  const remainingToday = patientBooklets.filter(
    (b) => b.nextAppointment && isToday(b.nextAppointment)
  );

  // Derived values
  const hasNoPatients = patientBooklets.length === 0;
  const upcomingAppointments = patientBooklets.filter(
    (b) => b.nextAppointment && !isToday(b.nextAppointment)
  );

  // Show loading while data is being fetched
  if (currentUser === undefined || patientBooklets === undefined) {
    return <DoctorDashboardSkeleton />;
  }

  // Responsive padding
  const screenPadding = select({ phone: 16, tablet: 32 });

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ paddingHorizontal: screenPadding }}
    >
      {/* Stats */}
      <View className="flex-row pt-4">
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-5 mx-2 border border-gray-100 dark:border-gray-700">
          <Text className="text-3xl font-bold text-blue-500">
            {patientBooklets.length}
          </Text>
          <Text className="text-gray-400 text-sm">Active Patients</Text>
        </View>
      </View>

      {/* Welcome Empty State - when no patients */}
      {hasNoPatients ? (
        <View className="mt-8 mb-8">
          <EmptyState
            icon={QrCode}
            iconColor="#3b82f6"
            iconBgClassName="bg-blue-50 dark:bg-blue-900/30"
            title={`Welcome, Dr. ${currentUser?.user?.fullName?.split(" ").pop()}!`}
            description="Start by scanning a patient's QR code to add them to your patient list."
            action={{
              label: "Scan QR Code",
              onPress: () => router.push("/(doctor)/(tabs)/scan"),
            }}
          />
        </View>
      ) : (
        <>
          {/* Upcoming Appointments */}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Appointments
            </Text>
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming appointments"
                description="Schedule appointments during patient visits"
                size="small"
              />
            ) : (
              <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={12}>
                {upcomingAppointments.map((booklet) => (
                  <CardPressable
                    key={booklet.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
                    onPress={() =>
                      router.push(`/(doctor)/booklet/${booklet.id}`)
                    }
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 dark:text-white">
                          {booklet.motherName}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {booklet.label}
                        </Text>
                      </View>
                      <View className="border border-blue-300 dark:border-blue-500 px-3 py-1 rounded-full">
                        <Text className="text-blue-500 text-sm font-medium">
                          {formatRelativeDate(booklet.nextAppointment!)}
                        </Text>
                      </View>
                    </View>
                  </CardPressable>
                ))}
              </ResponsiveGrid>
            )}
          </View>

          {/* Recent Patients */}
          <View className="mt-8 mb-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Patients
            </Text>
            {patientBooklets.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No patients yet"
                description="Scan a patient's QR code to get started"
                size="small"
              />
            ) : (
              <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={12}>
                {patientBooklets.slice(0, 6).map((booklet) => (
                  <CardPressable
                    key={booklet.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
                    onPress={() =>
                      router.push(`/(doctor)/booklet/${booklet.id}`)
                    }
                  >
                    <Text className="font-semibold text-gray-900 dark:text-white">
                      {booklet.motherName}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {booklet.label}
                    </Text>
                    {booklet.lastVisitDate && (
                      <Text className="text-gray-400 text-xs mt-1">
                        Last visit: {formatRelativeDate(booklet.lastVisitDate)}
                      </Text>
                    )}
                  </CardPressable>
                ))}
              </ResponsiveGrid>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#0f172a",
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
  },
  statsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  countBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  expectedArrivalText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: "auto",
  },
  emptySection: {
    marginHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    alignItems: "center",
  },
  emptySectionText: {
    fontSize: 14,
    color: "#64748b",
  },
  patientCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  patientCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  patientAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  patientMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  patientAOG: {
    fontSize: 13,
    color: "#94a3b8",
  },
  patientMetaDivider: {
    fontSize: 13,
    color: "#475569",
    marginHorizontal: 6,
  },
  patientLastSeen: {
    fontSize: 13,
    color: "#64748b",
  },
  entryTypeBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  entryTypeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f59e0b",
    letterSpacing: 0.5,
  },
  patientActions: {
    marginLeft: 8,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  openBookletButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  openBookletText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
    marginRight: 4,
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    borderRadius: 12,
  },
  collapsibleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  collapsibleTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  countBadgeSmall: {
    backgroundColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countBadgeTextSmall: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
  seenTodayContent: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  seenCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  seenCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  seenCardInfo: {
    flex: 1,
  },
  seenCardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  seenCardMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  summaryButton: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  summaryButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3b82f6",
    letterSpacing: 0.5,
  },
});
