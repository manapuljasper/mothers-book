import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore, useBookletStore, useMedicalStore } from "../../../src/stores";
import { formatRelativeDate } from "../../../src/utils";
import {
  AnimatedView,
  CardPressable,
  AnimatedNumber,
} from "../../../src/components/ui";

export default function DoctorDashboard() {
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <AnimatedView entering="fade" className="bg-blue-600 px-6 py-8">
          <Text className="text-white text-lg">Welcome back,</Text>
          <Text className="text-white text-2xl font-bold">
            {doctorProfile?.fullName || "Doctor"}
          </Text>
        </AnimatedView>

        {/* Stats */}
        <View className="flex-row px-4 -mt-4">
          <AnimatedView
            entering="fadeUp"
            delay={100}
            className="flex-1 bg-white rounded-xl p-4 mx-2 shadow-sm"
          >
            <AnimatedNumber
              value={patientBooklets.length}
              className="text-3xl font-bold text-blue-600"
            />
            <Text className="text-gray-500 text-sm">Active Patients</Text>
          </AnimatedView>
          <AnimatedView
            entering="fadeUp"
            delay={200}
            className="flex-1 bg-white rounded-xl p-4 mx-2 shadow-sm"
          >
            <AnimatedNumber
              value={pendingLabs.length}
              className="text-3xl font-bold text-amber-600"
            />
            <Text className="text-gray-500 text-sm">Pending Labs</Text>
          </AnimatedView>
        </View>

        {/* Upcoming Appointments */}
        <View className="px-6 mt-6">
          <AnimatedView entering="fade" delay={250}>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Appointments
            </Text>
          </AnimatedView>
          {upcomingAppointments.length === 0 ? (
            <AnimatedView entering="fadeUp" delay={300} className="bg-white rounded-xl p-6">
              <Text className="text-gray-500 text-center">
                No upcoming appointments
              </Text>
            </AnimatedView>
          ) : (
            upcomingAppointments.map((booklet) => (
              <CardPressable key={booklet.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {booklet.motherName}
                    </Text>
                    <Text className="text-gray-500 text-sm">{booklet.label}</Text>
                  </View>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 text-sm font-medium">
                      {formatRelativeDate(booklet.nextAppointment!)}
                    </Text>
                  </View>
                </View>
              </CardPressable>
            ))
          )}
        </View>

        {/* Recent Patients */}
        <View className="px-6 mt-6 mb-8">
          <AnimatedView entering="fade" delay={350}>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Recent Patients
            </Text>
          </AnimatedView>
          {patientBooklets.slice(0, 5).map((booklet) => (
            <CardPressable key={booklet.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <Text className="font-semibold text-gray-900">
                {booklet.motherName}
              </Text>
              <Text className="text-gray-500 text-sm">{booklet.label}</Text>
              {booklet.lastVisitDate && (
                <Text className="text-gray-400 text-xs mt-1">
                  Last visit: {formatRelativeDate(booklet.lastVisitDate)}
                </Text>
              )}
            </CardPressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
