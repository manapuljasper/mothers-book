import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Image,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ShieldCheck,
  Briefcase,
  Navigation,
  Phone,
  Clock,
  Pencil,
  Moon,
  HelpCircle,
  ChevronRight,
  LogOut,
  MapPin,
  Star,
} from "lucide-react-native";
import { useThemeStore } from "../../../src/stores";
import {
  useCurrentUser,
  useSignOut,
  useClinicsByDoctor,
} from "../../../src/hooks";

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

export default function DoctorProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUser = useCurrentUser();
  const user = currentUser?.user;
  const doctorProfile = currentUser?.doctorProfile;
  const signOut = useSignOut();
  const { colorScheme, toggleTheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  // Get clinics for this doctor
  const clinics = useClinicsByDoctor(doctorProfile?._id as string);

  // Extract data from profile
  const displayName = user?.fullName || "Doctor";
  const specialization = doctorProfile?.specialization || "";
  const prcNumber = doctorProfile?.prcNumber || "";
  const contactNumber = doctorProfile?.contactNumber || "";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
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
      Alert.alert(
        "No Location Set",
        "Add a Google Maps link in Edit Profile to enable directions."
      );
    }
  };

  const handleClinicContact = async (clinicContactNumber?: string) => {
    const number = clinicContactNumber || contactNumber;
    if (number) {
      const phoneUrl = `tel:${number.replace(/\s/g, "")}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert("Error", "Unable to make phone call");
      }
    } else {
      Alert.alert(
        "No Contact Number",
        "Add a contact number in Edit Profile."
      );
    }
  };

  const handleHelpSupport = () => {
    Alert.alert("Help & Support", "Support options coming soon!");
  };

  // Get initials for avatar fallback
  const initials =
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DR";

  // Format schedule display
  const formatScheduleHours = (item: ScheduleItem) => {
    return `${item.startTime} - ${item.endTime}`;
  };

  // Render a clinic card
  const renderClinicCard = (clinic: Clinic) => {
    const hasGoogleMapsLink = !!clinic.googleMapsLink;
    const clinicContact = clinic.contactNumber || contactNumber;

    return (
      <View
        key={clinic._id}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/60 mb-4"
      >
        {/* Clinic Header */}
        <View className="flex-row items-start mb-4">
          <View className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl mr-4">
            <Briefcase
              size={24}
              color={isDark ? "#60A5FA" : "#2563EB"}
              strokeWidth={1.5}
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                {clinic.name}
              </Text>
              {clinic.isPrimary && (
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
                ? "bg-blue-600 active:bg-blue-700"
                : "bg-gray-300 dark:bg-slate-600"
            }`}
            style={
              hasGoogleMapsLink
                ? {
                    shadowColor: "#1e40af",
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
            onPress={() => handleClinicContact(clinic.contactNumber)}
            className={`flex-1 flex-row items-center justify-center py-2.5 px-4 rounded-xl border ${
              clinicContact
                ? "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 active:bg-gray-100 dark:active:bg-slate-600"
                : "bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
            }`}
          >
            <Phone
              size={18}
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
        {/* Gradient Header */}
        <LinearGradient
          colors={
            isDark
              ? [
                  "rgba(30, 58, 138, 0.4)",
                  "rgba(30, 58, 138, 0.1)",
                  "transparent",
                ]
              : [
                  "rgba(59, 130, 246, 0.15)",
                  "rgba(59, 130, 246, 0.05)",
                  "transparent",
                ]
          }
          style={{ paddingTop: insets.top }}
        >
          {/* Header Title */}
          <View className="py-4">
            <Text className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              Profile
            </Text>
          </View>

          {/* Profile Avatar Section */}
          <View className="items-center pb-8 px-6">
            {/* Avatar with glow effect */}
            <View className="relative mb-5">
              {/* Glow effect */}
              <View
                className="absolute -inset-1 rounded-full opacity-30"
                style={{
                  backgroundColor: isDark ? "#60A5FA" : "#3B82F6",
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                }}
              />
              {/* Avatar */}
              <View className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 bg-blue-100 dark:bg-blue-900 items-center justify-center overflow-hidden">
                {doctorProfile?.avatarUrl ? (
                  <Image
                    source={{ uri: doctorProfile.avatarUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {initials}
                  </Text>
                )}
              </View>
              {/* Online status indicator */}
              <View className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white dark:border-slate-800" />
            </View>

            {/* Name and Specialization */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {displayName}
            </Text>
            {specialization ? (
              <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-4">
                {specialization}
              </Text>
            ) : null}

            {/* PRC Verified Badge */}
            {prcNumber ? (
              <View className="flex-row items-center px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <ShieldCheck
                  size={14}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                  strokeWidth={2}
                />
                <Text className="text-blue-600 dark:text-blue-400 text-xs font-semibold ml-1.5">
                  PRC Verified: {prcNumber}
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
              {clinics && clinics.length > 1 ? "My Clinics" : "Clinic Information"}
            </Text>

            {clinics === undefined ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            ) : clinics.length === 0 ? (
              <View className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-center mb-3">
                  No clinics added yet
                </Text>
                <Pressable
                  onPress={() => router.push("/(doctor)/edit-profile")}
                  className="bg-blue-600 px-4 py-2 rounded-lg active:bg-blue-700"
                >
                  <Text className="text-white font-medium">Add a Clinic</Text>
                </Pressable>
              </View>
            ) : (
              clinics.map((clinic: Clinic) => renderClinicCard(clinic))
            )}
          </View>

          {/* Account & Settings Section */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
              Account & Settings
            </Text>

            <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700/60">
              {/* Edit Profile */}
              <Pressable
                onPress={() => router.push("/(doctor)/edit-profile")}
                className="flex-row items-center justify-between p-4 active:bg-gray-50 dark:active:bg-slate-700/50"
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-500/10 items-center justify-center mr-3.5">
                    <Pencil size={16} color="#f97316" strokeWidth={2} />
                  </View>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    Edit Profile Details
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                  strokeWidth={2}
                />
              </Pressable>

              {/* Divider */}
              <View className="h-px bg-gray-100 dark:bg-slate-700/50 mx-4" />

              {/* Dark Appearance */}
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 items-center justify-center mr-3.5">
                    <Moon size={16} color="#a855f7" strokeWidth={2} />
                  </View>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Appearance
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-100 dark:bg-slate-700/50 mx-4" />

              {/* Help & Support */}
              <Pressable
                onPress={handleHelpSupport}
                className="flex-row items-center justify-between p-4 active:bg-gray-50 dark:active:bg-slate-700/50"
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-500/10 items-center justify-center mr-3.5">
                    <HelpCircle size={16} color="#22c55e" strokeWidth={2} />
                  </View>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    Help & Support
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-red-50 dark:bg-red-500/10 py-4 rounded-2xl border border-red-100 dark:border-red-500/20 active:bg-red-100 dark:active:bg-red-500/20 mb-4"
          >
            <LogOut size={18} color="#ef4444" strokeWidth={2} />
            <Text className="text-red-600 dark:text-red-400 font-semibold ml-2">
              Logout
            </Text>
          </Pressable>

          {/* Version Footer */}
          <Text className="text-gray-400 dark:text-gray-500 text-xs text-center py-6">
            Mother's Book v1.0.0 - Phase 1
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
