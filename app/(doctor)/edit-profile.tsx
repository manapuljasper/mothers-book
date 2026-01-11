import { useState, useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentUser, useUpdateDoctorProfile } from "../../src/hooks";
import { ModalHeader, TextField, Button } from "../../src/components/ui";

export default function EditDoctorProfileScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isCreateMode = mode === "create";

  const currentUser = useCurrentUser();
  const updateProfile = useUpdateDoctorProfile();

  // Extract user and profile only when available and not pending
  const user = currentUser && "user" in currentUser ? currentUser.user : null;
  const doctorProfile = currentUser && "doctorProfile" in currentUser ? currentUser.doctorProfile : null;

  // Form state
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [prcNumber, setPrcNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicSchedule, setClinicSchedule] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form values when user data loads
  useEffect(() => {
    if (user && doctorProfile && !initialized) {
      setFullName(user.fullName || "");
      setSpecialization(doctorProfile.specialization || "");
      setPrcNumber(doctorProfile.prcNumber || "");
      setContactNumber(doctorProfile.contactNumber || "");
      setClinicName(doctorProfile.clinicName || "");
      setClinicAddress(doctorProfile.clinicAddress || "");
      setClinicSchedule(doctorProfile.clinicSchedule || "");
      setInitialized(true);
    }
  }, [user, doctorProfile, initialized]);

  // Show loading while data is loading
  if (currentUser === undefined || (currentUser && "pending" in currentUser)) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name is required");
      return;
    }
    if (!prcNumber.trim()) {
      Alert.alert("Error", "PRC License Number is required");
      return;
    }
    if (!clinicName.trim()) {
      Alert.alert("Error", "Clinic name is required");
      return;
    }
    if (!clinicAddress.trim()) {
      Alert.alert("Error", "Clinic address is required");
      return;
    }

    setIsSaving(true);
    try {
      if (!doctorProfile?._id) {
        throw new Error("No doctor profile found");
      }
      await updateProfile({
        doctorId: doctorProfile._id as string,
        fullName: fullName.trim(),
        specialization: specialization.trim() || undefined,
        prcNumber: prcNumber.trim(),
        contactNumber: contactNumber.trim() || undefined,
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
        clinicSchedule: clinicSchedule.trim() || undefined,
      });

      if (isCreateMode) {
        router.replace("/(doctor)/(tabs)");
      } else {
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ModalHeader
          title={isCreateMode ? "Complete Your Profile" : "Edit Profile"}
          onClose={isCreateMode ? (() => {}) : () => router.back()}
        />

        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          <View className="py-4">
            {/* Welcome message for create mode */}
            {isCreateMode && (
              <View className="mb-6">
                <Text className="text-lg text-gray-700 dark:text-gray-300">
                  Welcome! Please complete your profile to continue.
                </Text>
              </View>
            )}

            {/* Personal Information */}
            <View className="mb-6">
              <TextField
                label="Full Name"
                required
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-6">
              <TextField
                label="Specialization"
                value={specialization}
                onChangeText={setSpecialization}
                placeholder="e.g., OB-GYN, Pediatrics"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-6">
              <TextField
                label="PRC License Number"
                required
                value={prcNumber}
                onChangeText={setPrcNumber}
                placeholder="Enter your PRC number"
                autoCapitalize="characters"
              />
            </View>

            <View className="mb-6">
              <TextField
                label="Contact Number"
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="Enter your contact number"
                keyboardType="phone-pad"
              />
            </View>

            {/* Clinic Information */}
            <View className="mb-6">
              <TextField
                label="Clinic Name"
                required
                value={clinicName}
                onChangeText={setClinicName}
                placeholder="Enter clinic name"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-6">
              <TextField
                label="Clinic Address"
                required
                value={clinicAddress}
                onChangeText={setClinicAddress}
                placeholder="Enter clinic address"
                multiline
                numberOfLines={2}
              />
            </View>

            <View className="mb-6">
              <TextField
                label="Clinic Schedule"
                value={clinicSchedule}
                onChangeText={setClinicSchedule}
                placeholder="e.g., Mon-Fri 9AM-5PM"
              />
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="primary"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
          >
            {isCreateMode ? "Get Started" : "Save Changes"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
