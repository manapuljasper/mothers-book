import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { QrCode, Calendar, Users } from "lucide-react-native";
import { useAuthStore } from "../../../src/stores";
import { useBookletsByDoctor } from "../../../src/hooks";
import { formatRelativeDate } from "../../../src/utils";
import { CardPressable, EmptyState, LoadingScreen } from "../../../src/components/ui";

export default function DoctorDashboard() {
  const router = useRouter();
  const { currentUser, doctorProfile } = useAuthStore();

  const { data: patientBooklets = [], isLoading } = useBookletsByDoctor(doctorProfile?.id);

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Stats */}
      <View className="flex-row px-4 pt-4">
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-5 mx-2 border border-gray-100 dark:border-gray-700">
          <Text className="text-3xl font-bold text-blue-500">
            {patientBooklets.length}
          </Text>
          <Text className="text-gray-400 text-sm">Active Patients</Text>
        </View>
      </View>

      {/* Welcome Empty State - when no patients */}
      {hasNoPatients ? (
        <View className="px-6 mt-8 mb-8">
          <EmptyState
            icon={QrCode}
            iconColor="#3b82f6"
            iconBgClassName="bg-blue-50 dark:bg-blue-900/30"
            title={`Welcome, Dr. ${currentUser?.fullName?.split(" ").pop()}!`}
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
          <View className="px-6 mt-8">
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
              upcomingAppointments.map((booklet) => (
                <CardPressable
                  key={booklet.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-3 border border-gray-100 dark:border-gray-700"
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
              ))
            )}
          </View>

          {/* Recent Patients */}
          <View className="px-6 mt-8 mb-8">
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
              patientBooklets.slice(0, 5).map((booklet) => (
                <CardPressable
                  key={booklet.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-3 border border-gray-100 dark:border-gray-700"
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
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
