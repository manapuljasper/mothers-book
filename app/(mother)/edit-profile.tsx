import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCurrentUser, useUpdateMotherProfile } from "../../src/hooks";
import {
  ModalHeader,
  TextField,
  Button,
  DatePickerButton,
} from "../../src/components/ui";

export default function EditMotherProfileScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isCreateMode = mode === "create";

  const currentUser = useCurrentUser();
  const updateProfile = useUpdateMotherProfile();

  // Extract user and profile only when available and not pending
  const user = currentUser && "user" in currentUser ? currentUser.user : null;
  const motherProfile = currentUser && "motherProfile" in currentUser ? currentUser.motherProfile : null;

  // Form state
  const [fullName, setFullName] = useState("");
  const [birthdate, setBirthdate] = useState<Date>(new Date());
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [babyName, setBabyName] = useState("");

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form values when user data loads
  useEffect(() => {
    if (user && motherProfile && !initialized) {
      setFullName(user.fullName || "");
      setBirthdate(motherProfile.birthdate ? new Date(motherProfile.birthdate) : new Date());
      setContactNumber(motherProfile.contactNumber || "");
      setAddress(motherProfile.address || "");
      setEmergencyContactName(motherProfile.emergencyContactName || "");
      setEmergencyContact(motherProfile.emergencyContact || "");
      setBabyName(motherProfile.babyName || "");
      setInitialized(true);
    }
  }, [user, motherProfile, initialized]);

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

    setIsSaving(true);
    try {
      if (!motherProfile?._id) {
        throw new Error("No mother profile found");
      }
      await updateProfile({
        motherId: motherProfile._id as string,
        fullName: fullName.trim(),
        birthdate,
        contactNumber: contactNumber.trim() || undefined,
        address: address.trim() || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        babyName: babyName.trim() || undefined,
      });

      if (isCreateMode) {
        router.replace("/(mother)/(tabs)");
      } else {
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
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
            loading={isSaving}
            disabled={isSaving}
          >
            {isCreateMode ? "Get Started" : "Save Changes"}
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
