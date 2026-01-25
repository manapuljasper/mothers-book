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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCurrentUser,
  useClinic,
  useCreateClinic,
  useUpdateClinic,
} from "../../src/hooks";
import {
  ModalHeader,
  Button,
  ScheduleEditor,
} from "../../src/components/ui";
import { FormTextField } from "../../src/components/form";
import { clinicSchema, ClinicFormData } from "../../src/utils/validation";
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

  // Schedule state (managed separately as it's complex)
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: "",
      address: "",
      contactNumber: "",
      googleMapsLink: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Initialize form values when clinic data loads (edit mode)
  useEffect(() => {
    if (!isCreateMode && existingClinic) {
      reset({
        name: existingClinic.name || "",
        address: existingClinic.address || "",
        contactNumber: existingClinic.contactNumber || "",
        googleMapsLink: existingClinic.googleMapsLink || "",
      });
      if (existingClinic.schedule && Array.isArray(existingClinic.schedule)) {
        setSchedule(existingClinic.schedule);
      }
    }
  }, [existingClinic, isCreateMode, reset]);

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

  const onSubmit = async (data: ClinicFormData) => {
    try {
      if (isCreateMode) {
        if (!doctorProfile?._id) {
          throw new Error("No doctor profile found");
        }
        await createClinic({
          doctorId: doctorProfile._id as string,
          name: data.name.trim(),
          address: data.address.trim(),
          contactNumber: data.contactNumber?.trim() || undefined,
          googleMapsLink: data.googleMapsLink?.trim() || undefined,
          schedule: schedule.length > 0 ? schedule : undefined,
        });
      } else {
        if (!clinicId) {
          throw new Error("No clinic ID");
        }
        await updateClinic({
          clinicId,
          name: data.name.trim(),
          address: data.address.trim(),
          contactNumber: data.contactNumber?.trim() || undefined,
          googleMapsLink: data.googleMapsLink?.trim() || undefined,
          schedule: schedule.length > 0 ? schedule : undefined,
        });
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save clinic. Please try again.");
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

            <FormTextField
              control={control}
              name="name"
              label="Clinic Name"
              required
              placeholder="Angat Women's Clinic"
              autoCapitalize="words"
              containerClassName="mb-5"
            />

            <FormTextField
              control={control}
              name="address"
              label="Clinic Address"
              required
              placeholder="Unit 204, Medical Arts Building, Governor's Drive, Manila"
              multiline
              numberOfLines={2}
              containerClassName="mb-5"
            />

            <FormTextField
              control={control}
              name="contactNumber"
              label="Clinic Contact Number"
              placeholder="+63 2 1234 5678"
              keyboardType="phone-pad"
              helperText="Optional - clinic-specific contact"
              containerClassName="mb-5"
            />

            <FormTextField
              control={control}
              name="googleMapsLink"
              label="Google Maps Link"
              placeholder="https://maps.google.com/..."
              keyboardType="url"
              autoCapitalize="none"
              leftIcon={Link2}
              helperText="Paste your clinic's Google Maps share link for easy directions"
              containerClassName="mb-8"
            />

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
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isCreateMode ? "Add Clinic" : "Save Changes"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
