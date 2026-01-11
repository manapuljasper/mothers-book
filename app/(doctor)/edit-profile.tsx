import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/stores";
import { useUpdateDoctorProfile } from "../../src/hooks";
import { ModalHeader, TextField, Button } from "../../src/components/ui";

export default function EditDoctorProfileScreen() {
  const router = useRouter();
  const { currentUser, doctorProfile } = useAuthStore();
  const updateProfileMutation = useUpdateDoctorProfile();

  // Form state
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [specialization, setSpecialization] = useState(doctorProfile?.specialization || "");
  const [prcNumber, setPrcNumber] = useState(doctorProfile?.prcNumber || "");
  const [contactNumber, setContactNumber] = useState(doctorProfile?.contactNumber || "");
  const [clinicName, setClinicName] = useState(doctorProfile?.clinicName || "");
  const [clinicAddress, setClinicAddress] = useState(doctorProfile?.clinicAddress || "");
  const [clinicSchedule, setClinicSchedule] = useState(doctorProfile?.clinicSchedule || "");

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

    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        specialization: specialization.trim() || undefined,
        prcNumber: prcNumber.trim(),
        contactNumber: contactNumber.trim() || undefined,
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim() || undefined,
        clinicSchedule: clinicSchedule.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ModalHeader title="Edit Profile" onClose={() => router.back()} />

        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          <View className="py-4">
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
            loading={updateProfileMutation.isPending}
            disabled={updateProfileMutation.isPending}
          >
            Save Changes
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
