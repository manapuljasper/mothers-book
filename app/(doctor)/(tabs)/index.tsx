import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore, useBookletStore, useMedicalStore } from "../../../src/stores";
import { formatRelativeDate } from "../../../src/utils";
import { CardPressable } from "../../../src/components/ui";

export default function DoctorDashboard() {
  const router = useRouter();
  const { doctorProfile } = useAuthStore();
  const { getBookletsByDoctor } = useBookletStore();
  const { getPendingLabs } = useMedicalStore();

  const patientBooklets = doctorProfile ? getBookletsByDoctor(doctorProfile.id) : [];
  const pendingLabs = getPendingLabs();

  // Get upcoming appointments
  const upcomingAppointments = patientBooklets
    .filter((b) => b.nextAppointment)
    .sort((a, b) => {
      const dateA = new Date(a.nextAppointment!).getTime();
      const dateB = new Date(b.nextAppointment!).getTime();
      return dateA - dateB;
    })
    .slice(0, 5);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Stats */}
      <View className="flex-row px-4 pt-4">
          <View className="flex-1 bg-white rounded-xl p-5 mx-2 border border-gray-100">
            <Text className="text-3xl font-bold text-blue-500">
              {patientBooklets.length}
            </Text>
            <Text className="text-gray-400 text-sm">Active Patients</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-5 mx-2 border border-gray-100">
            <Text className="text-3xl font-bold text-amber-500">
              {pendingLabs.length}
            </Text>
            <Text className="text-gray-400 text-sm">Pending Labs</Text>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Appointments
          </Text>
          {upcomingAppointments.length === 0 ? (
            <View className="bg-white rounded-xl p-6 border border-gray-100">
              <Text className="text-gray-400 text-center">
                No upcoming appointments
              </Text>
            </View>
          ) : (
            upcomingAppointments.map((booklet) => (
              <CardPressable
                key={booklet.id}
                className="bg-white rounded-xl p-5 mb-3 border border-gray-100"
                onPress={() => router.push(`/(doctor)/booklet/${booklet.id}`)}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {booklet.motherName}
                    </Text>
                    <Text className="text-gray-400 text-sm">{booklet.label}</Text>
                  </View>
                  <View className="border border-blue-300 px-3 py-1 rounded-full">
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
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Recent Patients
          </Text>
          {patientBooklets.slice(0, 5).map((booklet) => (
            <CardPressable
              key={booklet.id}
              className="bg-white rounded-xl p-5 mb-3 border border-gray-100"
              onPress={() => router.push(`/(doctor)/booklet/${booklet.id}`)}
            >
              <Text className="font-semibold text-gray-900">
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
        </View>
    </ScrollView>
  );
}
