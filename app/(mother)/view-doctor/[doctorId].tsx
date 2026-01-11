import { View, Text, ScrollView, Pressable, Linking, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Phone, MapPin, Clock, Award } from "lucide-react-native";
import { useDoctorById } from "../../../src/hooks";
import { ModalHeader, LoadingScreen } from "../../../src/components/ui";

export default function ViewDoctorProfileScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const router = useRouter();
  const { data: doctor, isLoading } = useDoctorById(doctorId);

  const handleCall = () => {
    if (doctor?.contactNumber) {
      const phoneUrl = `tel:${doctor.contactNumber}`;
      Linking.canOpenURL(phoneUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(phoneUrl);
          } else {
            Alert.alert("Error", "Unable to make phone call");
          }
        })
        .catch(() => {
          Alert.alert("Error", "Unable to make phone call");
        });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!doctor) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <ModalHeader title="Doctor Profile" onClose={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400">
            Doctor not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get initials for avatar
  const initials = doctor.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "DR";

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ModalHeader title="Doctor Profile" onClose={() => router.back()} />

      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center py-6 px-6">
          <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {initials}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            {doctor.fullName}
          </Text>
          {doctor.specialization && (
            <Text className="text-blue-600 dark:text-blue-400 text-lg mt-1">
              {doctor.specialization}
            </Text>
          )}
        </View>

        {/* Info Sections */}
        <View className="px-6">
          {/* License */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Award size={18} color="#3b82f6" strokeWidth={1.5} />
              <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                PRC License Number
              </Text>
            </View>
            <Text className="text-gray-900 dark:text-white font-medium text-lg">
              {doctor.prcNumber}
            </Text>
          </View>

          {/* Contact */}
          {doctor.contactNumber && (
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Phone size={18} color="#3b82f6" strokeWidth={1.5} />
                <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  Contact Number
                </Text>
              </View>
              <Text className="text-gray-900 dark:text-white font-medium text-lg">
                {doctor.contactNumber}
              </Text>
            </View>
          )}

          {/* Clinic */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <MapPin size={18} color="#3b82f6" strokeWidth={1.5} />
              <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                Clinic
              </Text>
            </View>
            <Text className="text-gray-900 dark:text-white font-semibold text-lg">
              {doctor.clinicName}
            </Text>
            {doctor.clinicAddress && (
              <Text className="text-gray-600 dark:text-gray-300 mt-1">
                {doctor.clinicAddress}
              </Text>
            )}
          </View>

          {/* Schedule */}
          {doctor.clinicSchedule && (
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Clock size={18} color="#3b82f6" strokeWidth={1.5} />
                <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  Schedule
                </Text>
              </View>
              <Text className="text-gray-900 dark:text-white font-medium text-lg">
                {doctor.clinicSchedule}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Call Button */}
      {doctor.contactNumber && (
        <View className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <Pressable
            onPress={handleCall}
            className="bg-blue-600 rounded-xl py-4 flex-row items-center justify-center active:bg-blue-700"
          >
            <Phone size={20} color="#ffffff" strokeWidth={1.5} />
            <Text className="text-white font-semibold text-lg ml-2">
              Call Doctor
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
