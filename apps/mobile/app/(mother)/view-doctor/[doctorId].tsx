import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Phone,
  MapPin,
  Clock,
  Navigation,
  Star,
  Briefcase,
  ShieldCheck,
  X,
} from "lucide-react-native";
import { useDoctorById, useClinicsByDoctor } from "@/hooks";
import { LoadingScreen } from "@/components/ui";
import { useThemeStore } from "@/stores";

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
  const insets = useSafeAreaInsets();
  const doctor = useDoctorById(doctorId);
  const clinics = useClinicsByDoctor(doctorId);
  const isLoading = doctor === undefined;
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

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
      <View className="flex-1 bg-gray-50 dark:bg-slate-900">
        <View
          className="flex-row items-center justify-end px-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <X size={24} color="#ffffff" strokeWidth={2} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400">
            Doctor not found
          </Text>
        </View>
      </View>
    );
  }

  // Get initials for avatar
  const initials =
    doctor.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DR";

  // Format schedule display
  const formatScheduleHours = (item: ScheduleItem) => {
    return `${item.startTime} - ${item.endTime}`;
  };

  // Render a clinic card (matching doctor profile design)
  const renderClinicCard = (clinic: Clinic) => {
    const hasGoogleMapsLink = !!clinic.googleMapsLink;
    const clinicContact = clinic.contactNumber || doctor.contactNumber;

    return (
      <View
        key={clinic._id}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/60 mb-4"
      >
        {/* Clinic Header */}
        <View className="flex-row items-start mb-4">
          <View className="bg-pink-50 dark:bg-pink-500/10 p-3 rounded-xl mr-4">
            <Briefcase
              size={24}
              color={isDark ? "#f472b6" : "#db2777"}
              strokeWidth={1.5}
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                {clinic.name}
              </Text>
              {clinic.isPrimary && clinics && clinics.length > 1 && (
                <View className="flex-row items-center bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full ml-2">
                  <Star
                    size={12}
                    color="#f59e0b"
                    fill="#f59e0b"
                    strokeWidth={2}
                  />
                  <Text className="text-amber-700 dark:text-amber-400 text-xs font-medium ml-1">
                    Primary
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-start mt-1">
              <MapPin
                size={14}
                color={isDark ? "#9ca3af" : "#6b7280"}
                strokeWidth={2}
                style={{ marginTop: 2 }}
              />
              <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1.5 flex-1 leading-5">
                {clinic.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={() => handleDirections(clinic.googleMapsLink)}
            className={`flex-1 flex-row items-center justify-center py-2.5 px-4 rounded-xl ${
              hasGoogleMapsLink
                ? "bg-pink-600 active:bg-pink-700"
                : "bg-gray-300 dark:bg-slate-600"
            }`}
            style={
              hasGoogleMapsLink
                ? {
                    shadowColor: "#db2777",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }
                : {}
            }
          >
            <Navigation
              size={18}
              color={hasGoogleMapsLink ? "#ffffff" : "#9ca3af"}
              strokeWidth={2}
            />
            <Text
              className={`text-sm font-medium ml-2 ${
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
            className={`flex-1 flex-row items-center justify-center py-2.5 px-4 rounded-xl border ${
              clinicContact
                ? "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 active:bg-gray-100 dark:active:bg-slate-600"
                : "bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
            }`}
          >
            <Phone
              size={18}
              color={
                clinicContact ? (isDark ? "#e5e7eb" : "#374151") : "#9ca3af"
              }
              strokeWidth={2}
            />
            <Text
              className={`text-sm font-medium ml-2 ${
                clinicContact
                  ? "text-gray-700 dark:text-gray-200"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Contact
            </Text>
          </Pressable>
        </View>

        {/* Weekly Schedule */}
        {clinic.schedule && clinic.schedule.length > 0 && (
          <View className="border-t border-gray-100 dark:border-slate-700/50 pt-4">
            <View className="flex-row items-center mb-3">
              <Clock
                size={14}
                color={isDark ? "#9ca3af" : "#6b7280"}
                strokeWidth={2}
              />
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-2">
                Weekly Schedule
              </Text>
            </View>

            <View className="gap-2.5">
              {clinic.schedule.map((item, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center"
                >
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {item.days}
                  </Text>
                  <View className="bg-gray-100 dark:bg-slate-700/80 px-2 py-0.5 rounded">
                    <Text className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatScheduleHours(item)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Gradient Header - Pink Theme */}
        <LinearGradient
          colors={
            isDark
              ? [
                  "rgba(157, 23, 77, 0.4)",
                  "rgba(157, 23, 77, 0.1)",
                  "transparent",
                ]
              : [
                  "rgba(236, 72, 153, 0.15)",
                  "rgba(236, 72, 153, 0.05)",
                  "transparent",
                ]
          }
          style={{ paddingTop: 16 }}
        >
          {/* Close Button */}
          <View className="flex-row items-center justify-end px-4 py-2">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center active:bg-black/20 dark:active:bg-white/20"
            >
              <X
                size={24}
                color={isDark ? "#ffffff" : "#374151"}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* Profile Avatar Section */}
          <View className="items-center pb-8 px-6">
            {/* Avatar with glow effect */}
            <View className="relative mb-5">
              {/* Glow effect */}
              <View
                className="absolute -inset-1 rounded-full opacity-30"
                style={{
                  backgroundColor: isDark ? "#f472b6" : "#ec4899",
                  shadowColor: "#ec4899",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                }}
              />
              {/* Avatar */}
              <View className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 dark:bg-pink-900 items-center justify-center overflow-hidden">
                <Text className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {initials}
                </Text>
              </View>
            </View>

            {/* Name and Specialization */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {doctor.fullName}
            </Text>
            {doctor.specialization ? (
              <Text className="text-pink-600 dark:text-pink-400 font-medium text-sm mb-4">
                {doctor.specialization}
              </Text>
            ) : null}

            {/* PRC Verified Badge */}
            {doctor.prcNumber ? (
              <View className="flex-row items-center px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20">
                <ShieldCheck
                  size={14}
                  color={isDark ? "#f472b6" : "#db2777"}
                  strokeWidth={2}
                />
                <Text className="text-pink-600 dark:text-pink-400 text-xs font-semibold ml-1.5">
                  PRC Verified: {doctor.prcNumber}
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* Content */}
        <View className="px-5 -mt-2">
          {/* Clinics Section */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
              {clinics && clinics.length > 1 ? "Clinics" : "Clinic Information"}
            </Text>

            {clinics === undefined ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#ec4899" />
              </View>
            ) : clinics.length === 0 ? (
              <View className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                  No clinic information available
                </Text>
              </View>
            ) : (
              clinics.map((clinic: Clinic) => renderClinicCard(clinic))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Call Button */}
      {doctor.contactNumber && (
        <View
          className="px-6 py-4 border-t border-gray-100 dark:border-slate-800"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Pressable
            onPress={() => handleCall()}
            className="bg-pink-600 rounded-2xl py-4 flex-row items-center justify-center active:bg-pink-700"
            style={{
              shadowColor: "#db2777",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Phone size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-white font-semibold text-lg ml-2">
              Call Doctor
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
