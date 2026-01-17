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
import { Link2 } from "lucide-react-native";
import {
  useCurrentUser,
  useClinic,
  useCreateClinic,
  useUpdateClinic,
} from "../../src/hooks";
import {
  ModalHeader,
  TextField,
  Button,
  ScheduleEditor,
} from "../../src/components/ui";
import type { ScheduleItem } from "../../src/components/ui";

export default function EditClinicScreen() {
  const router = useRouter();
  const { clinicId, mode } = useLocalSearchParams<{
    clinicId?: string;
    mode?: string;
  }>();
  const isCreateMode = mode === "create" || !clinicId;

  const currentUser = useCurrentUser();
  const doctorProfile =
    currentUser && "doctorProfile" in currentUser
      ? currentUser.doctorProfile
      : null;

  const existingClinic = useClinic(clinicId);
  const createClinic = useCreateClinic();
  const updateClinic = useUpdateClinic();

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form values when clinic data loads (edit mode)
  useEffect(() => {
    if (!isCreateMode && existingClinic && !initialized) {
      setName(existingClinic.name || "");
      setAddress(existingClinic.address || "");
      setContactNumber(existingClinic.contactNumber || "");
      setGoogleMapsLink(existingClinic.googleMapsLink || "");
      if (existingClinic.schedule && Array.isArray(existingClinic.schedule)) {
        setSchedule(existingClinic.schedule);
      }
      setInitialized(true);
    }
  }, [existingClinic, isCreateMode, initialized]);

  // Show loading while data is loading
  if (
    currentUser === undefined ||
    (!isCreateMode && existingClinic === undefined)
  ) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Clinic name is required");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Error", "Clinic address is required");
      return;
    }

    // Validate Google Maps link format if provided
    if (googleMapsLink.trim()) {
      const isValidGoogleMapsLink =
        googleMapsLink.includes("google.com/maps") ||
        googleMapsLink.includes("maps.google.com") ||
        googleMapsLink.includes("goo.gl/maps") ||
        googleMapsLink.includes("maps.app.goo.gl");

      if (!isValidGoogleMapsLink) {
        Alert.alert(
          "Invalid Link",
          "Please provide a valid Google Maps link. You can get this by:\n\n1. Open Google Maps\n2. Search for your clinic\n3. Tap Share\n4. Copy the link"
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      if (isCreateMode) {
        if (!doctorProfile?._id) {
          throw new Error("No doctor profile found");
        }
        await createClinic({
          doctorId: doctorProfile._id as string,
          name: name.trim(),
          address: address.trim(),
          contactNumber: contactNumber.trim() || undefined,
          googleMapsLink: googleMapsLink.trim() || undefined,
          schedule: schedule.length > 0 ? schedule : undefined,
        });
      } else {
        if (!clinicId) {
          throw new Error("No clinic ID");
        }
        await updateClinic({
          clinicId,
          name: name.trim(),
          address: address.trim(),
          contactNumber: contactNumber.trim() || undefined,
          googleMapsLink: googleMapsLink.trim() || undefined,
          schedule: schedule.length > 0 ? schedule : undefined,
        });
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save clinic. Please try again.");
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
          title={isCreateMode ? "Add Clinic" : "Edit Clinic"}
          onClose={() => router.back()}
        />

        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-4">
            {/* Clinic Information */}
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Clinic Details
            </Text>

            <View className="mb-5">
              <TextField
                label="Clinic Name"
                required
                value={name}
                onChangeText={setName}
                placeholder="Angat Women's Clinic"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-5">
              <TextField
                label="Clinic Address"
                required
                value={address}
                onChangeText={setAddress}
                placeholder="Unit 204, Medical Arts Building, Governor's Drive, Manila"
                multiline
                numberOfLines={2}
              />
            </View>

            <View className="mb-5">
              <TextField
                label="Clinic Contact Number"
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="+63 2 1234 5678"
                keyboardType="phone-pad"
                helperText="Optional - clinic-specific contact"
              />
            </View>

            <View className="mb-8">
              <TextField
                label="Google Maps Link"
                value={googleMapsLink}
                onChangeText={setGoogleMapsLink}
                placeholder="https://maps.google.com/..."
                keyboardType="url"
                autoCapitalize="none"
                leftIcon={Link2}
                helperText="Paste your clinic's Google Maps share link for easy directions"
              />
            </View>

            {/* Schedule */}
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Clinic Hours
            </Text>

            <View className="mb-8">
              <ScheduleEditor value={schedule} onChange={setSchedule} />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Add your clinic hours so patients know when you're available
              </Text>
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
            {isCreateMode ? "Add Clinic" : "Save Changes"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
