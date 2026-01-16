import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { QrCode, Calendar, Users } from "lucide-react-native";
import { useCurrentUser, useBookletsByDoctor, useResponsive } from "../../../src/hooks";
import { formatRelativeDate } from "../../../src/utils";
import { CardPressable, EmptyState, DoctorDashboardSkeleton } from "../../../src/components/ui";
import { ResponsiveGrid } from "../../../src/components/layout";

export default function DoctorDashboard() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const doctorProfile = currentUser?.doctorProfile;
  const { isTablet, select } = useResponsive();

  const patientBooklets = useBookletsByDoctor(doctorProfile?._id) ?? [];

  // Get upcoming appointments
  const upcomingAppointments = patientBooklets
    .filter((b) => b.nextAppointment)
    .sort((a, b) => {
      const dateA = new Date(a.nextAppointment!).getTime();
      const dateB = new Date(b.nextAppointment!).getTime();
      return dateA - dateB;
    })
    .slice(0, 5);

  const hasNoPatients = patientBooklets.length === 0;

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
                    onPress={() => router.push(`/(doctor)/booklet/${booklet.id}`)}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 dark:text-white">
                          {booklet.motherName}
                        </Text>
                        <Text className="text-gray-400 text-sm">{booklet.label}</Text>
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
                    onPress={() => router.push(`/(doctor)/booklet/${booklet.id}`)}
                  >
                    <Text className="font-semibold text-gray-900 dark:text-white">
                      {booklet.motherName}
                    </Text>
                    <Text className="text-gray-400 text-sm">{booklet.label}</Text>
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
