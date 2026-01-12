import { View, Text, ScrollView, Pressable, Linking, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Phone,
  MapPin,
  Clock,
  Award,
  Navigation,
  Star,
  Building2,
} from "lucide-react-native";
import { useDoctorById } from "../../../src/hooks";
import { ModalHeader, LoadingScreen } from "../../../src/components/ui";
import { useThemeStore } from "../../../src/stores";

interface ScheduleItem {
  days: string;
  startTime: string;
  endTime: string;
}

interface Clinic {
  _id: string;
  name: string;
  address: string;
  contactNumber?: string;
  googleMapsLink?: string;
  schedule?: ScheduleItem[];
  isPrimary: boolean;
}

export default function ViewDoctorProfileScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const router = useRouter();
  const doctor = useDoctorById(doctorId);
  const isLoading = doctor === undefined;
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  // Get clinics from the doctor
  const clinics = (doctor as { clinics?: Clinic[] } | null)?.clinics || [];

  const handleCall = (contactNumber?: string) => {
    const number = contactNumber || doctor?.contactNumber;
    if (number) {
      const phoneUrl = `tel:${number.replace(/\s/g, "")}`;
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

  const handleDirections = async (googleMapsLink?: string) => {
    if (googleMapsLink) {
      const canOpen = await Linking.canOpenURL(googleMapsLink);
      if (canOpen) {
        await Linking.openURL(googleMapsLink);
      } else {
        Alert.alert("Error", "Unable to open maps link");
      }
    } else {
      Alert.alert("Not Available", "Directions not available for this clinic.");
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

  // Render a single clinic card
  const renderClinicCard = (clinic: Clinic, isOnly: boolean) => {
    const hasGoogleMapsLink = !!clinic.googleMapsLink;
    const clinicContact = clinic.contactNumber || doctor.contactNumber;

    return (
      <View
        key={clinic._id}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4"
      >
        {/* Clinic Header */}
        <View className="flex-row items-start mb-3">
          <View className="mr-3 mt-0.5">
            <Building2 size={18} color="#3b82f6" strokeWidth={1.5} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-gray-900 dark:text-white font-semibold text-lg flex-1">
                {clinic.name}
              </Text>
              {clinic.isPrimary && !isOnly && (
                <View className="flex-row items-center bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full ml-2">
                  <Star size={12} color="#f59e0b" fill="#f59e0b" />
                  <Text className="text-amber-700 dark:text-amber-400 text-xs font-medium ml-1">
                    Primary
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Address */}
        <View className="flex-row items-start mb-3 ml-7">
          <MapPin
            size={14}
            color={isDark ? "#9ca3af" : "#6b7280"}
            strokeWidth={2}
            style={{ marginTop: 2 }}
          />
          <Text className="text-gray-600 dark:text-gray-300 ml-2 flex-1">
            {clinic.address}
          </Text>
        </View>

        {/* Schedule */}
        {clinic.schedule && clinic.schedule.length > 0 && (
          <View className="mb-3 ml-7">
            <View className="flex-row items-center mb-1">
              <Clock
                size={14}
                color={isDark ? "#9ca3af" : "#6b7280"}
                strokeWidth={2}
              />
              <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2 uppercase font-medium">
                Schedule
              </Text>
            </View>
            {clinic.schedule.map((s, i) => (
              <Text
                key={i}
                className="text-gray-700 dark:text-gray-200 text-sm ml-5"
              >
                {s.days}: {s.startTime} - {s.endTime}
              </Text>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-2 mt-2">
          <Pressable
            onPress={() => handleDirections(clinic.googleMapsLink)}
            className={`flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-lg ${
              hasGoogleMapsLink
                ? "bg-blue-600 active:bg-blue-700"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <Navigation
              size={16}
              color={hasGoogleMapsLink ? "#ffffff" : "#9ca3af"}
              strokeWidth={2}
            />
            <Text
              className={`text-sm font-medium ml-1.5 ${
                hasGoogleMapsLink
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Directions
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleCall(clinic.contactNumber)}
            className={`flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-lg border ${
              clinicContact
                ? "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 active:bg-gray-100 dark:active:bg-gray-600"
                : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            }`}
          >
            <Phone
              size={16}
              color={
                clinicContact
                  ? isDark
                    ? "#e5e7eb"
                    : "#374151"
                  : "#9ca3af"
              }
              strokeWidth={2}
            />
            <Text
              className={`text-sm font-medium ml-1.5 ${
                clinicContact
                  ? "text-gray-700 dark:text-gray-200"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Call
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

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

          {/* Contact Number (Personal) */}
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

          {/* Clinics Section */}
          {clinics.length > 0 && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {clinics.length > 1 ? "Clinics" : "Clinic"}
              </Text>
              {clinics.map((clinic) =>
                renderClinicCard(clinic, clinics.length === 1)
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Call Button */}
      {doctor.contactNumber && (
        <View className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <Pressable
            onPress={() => handleCall()}
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
