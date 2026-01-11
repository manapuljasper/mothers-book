import { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuthStore } from "../../src/stores";
import { useUpdateMotherProfile } from "../../src/hooks";
import {
  ModalHeader,
  TextField,
  Button,
  DatePickerButton,
} from "../../src/components/ui";

export default function EditMotherProfileScreen() {
  const router = useRouter();
  const { currentUser, motherProfile } = useAuthStore();
  const updateProfileMutation = useUpdateMotherProfile();

  // Form state
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [birthdate, setBirthdate] = useState<Date>(
    motherProfile?.birthdate || new Date()
  );
  const [contactNumber, setContactNumber] = useState(
    motherProfile?.contactNumber || ""
  );
  const [address, setAddress] = useState(motherProfile?.address || "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    motherProfile?.emergencyContactName || ""
  );
  const [emergencyContact, setEmergencyContact] = useState(
    motherProfile?.emergencyContact || ""
  );
  const [babyName, setBabyName] = useState(motherProfile?.babyName || "");

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name is required");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        birthdate,
        contactNumber: contactNumber.trim() || undefined,
        address: address.trim() || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        babyName: babyName.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthdate(selectedDate);
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
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
              Personal Information
            </Text>

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
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth
              </Text>
              <DatePickerButton
                value={birthdate}
                onPress={() => setShowDatePicker(true)}
                variant="selected"
                selectedColor="pink"
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

            <View className="mb-6">
              <TextField
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Emergency Contact */}
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-4 uppercase">
              Emergency Contact
            </Text>

            <View className="mb-6">
              <TextField
                label="Emergency Contact Name"
                value={emergencyContactName}
                onChangeText={setEmergencyContactName}
                placeholder="Enter emergency contact name"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-6">
              <TextField
                label="Emergency Contact Number"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="Enter emergency contact number"
                keyboardType="phone-pad"
              />
            </View>

            {/* Baby Info */}
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-4 uppercase">
              Baby Information
            </Text>

            <View className="mb-6">
              <TextField
                label="Baby Name"
                value={babyName}
                onChangeText={setBabyName}
                placeholder="Enter baby's name (if born)"
                autoCapitalize="words"
                helperText="Leave empty if baby is not yet born"
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

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
