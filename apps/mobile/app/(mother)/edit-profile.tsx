import { useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentUser, useUpdateMotherProfile, useSignOut } from "../../src/hooks";
import { ModalHeader, Button } from "../../src/components/ui";
import { FormTextField, FormDatePicker } from "../../src/components/form";
import {
  motherProfileSchema,
  MotherProfileFormData,
} from "../../src/utils/validation";

export default function EditMotherProfileScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isCreateMode = mode === "create";

  const currentUser = useCurrentUser();
  const updateProfile = useUpdateMotherProfile();
  const signOut = useSignOut();

  // Extract user and profile only when available and not pending
  const user = currentUser && "user" in currentUser ? currentUser.user : null;
  const motherProfile =
    currentUser && "motherProfile" in currentUser
      ? currentUser.motherProfile
      : null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<MotherProfileFormData>({
    resolver: zodResolver(motherProfileSchema),
    defaultValues: {
      fullName: "",
      birthdate: new Date(),
      contactNumber: "",
      address: "",
      emergencyContactName: "",
      emergencyContact: "",
      babyName: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Initialize form values when user data loads
  useEffect(() => {
    if (user && motherProfile) {
      reset({
        fullName: user.fullName || "",
        birthdate: motherProfile.birthdate
          ? new Date(motherProfile.birthdate)
          : new Date(),
        contactNumber: motherProfile.contactNumber || "",
        address: motherProfile.address || "",
        emergencyContactName: motherProfile.emergencyContactName || "",
        emergencyContact: motherProfile.emergencyContact || "",
        babyName: motherProfile.babyName || "",
      });
    }
  }, [user, motherProfile, reset]);

  // Show loading while data is loading
  if (currentUser === undefined || (currentUser && "pending" in currentUser)) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  const onSubmit = async (data: MotherProfileFormData) => {
    try {
      if (!motherProfile?._id) {
        throw new Error("No mother profile found");
      }
      await updateProfile({
        motherId: motherProfile._id as string,
        fullName: data.fullName.trim(),
        birthdate: data.birthdate,
        contactNumber: data.contactNumber?.trim() || undefined,
        address: data.address?.trim() || undefined,
        emergencyContactName: data.emergencyContactName?.trim() || undefined,
        emergencyContact: data.emergencyContact?.trim() || undefined,
        babyName: data.babyName?.trim() || undefined,
      });

      if (isCreateMode) {
        router.replace("/(mother)/(tabs)");
      } else {
        router.back();
      }
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
        <ModalHeader
          title={isCreateMode ? "Complete Your Profile" : "Edit Profile"}
          onClose={isCreateMode ? () => signOut() : () => router.back()}
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
              <FormTextField
                control={control}
                name="fullName"
                label="Full Name"
                required
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-6">
              <FormDatePicker
                control={control}
                name="birthdate"
                label="Date of Birth"
                variant="selected"
                selectedColor="pink"
                maximumDate={new Date()}
              />
            </View>

            <FormTextField
              control={control}
              name="contactNumber"
              label="Contact Number"
              placeholder="Enter your contact number"
              keyboardType="phone-pad"
              containerClassName="mb-6"
            />

            <FormTextField
              control={control}
              name="address"
              label="Address"
              placeholder="Enter your address"
              multiline
              numberOfLines={2}
              containerClassName="mb-6"
            />

            {/* Emergency Contact */}
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-4 uppercase">
              Emergency Contact
            </Text>

            <FormTextField
              control={control}
              name="emergencyContactName"
              label="Emergency Contact Name"
              placeholder="Enter emergency contact name"
              autoCapitalize="words"
              containerClassName="mb-6"
            />

            <FormTextField
              control={control}
              name="emergencyContact"
              label="Emergency Contact Number"
              placeholder="Enter emergency contact number"
              keyboardType="phone-pad"
              containerClassName="mb-6"
            />

            {/* Baby Info */}
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-4 uppercase">
              Baby Information
            </Text>

            <FormTextField
              control={control}
              name="babyName"
              label="Baby Name"
              placeholder="Enter baby's name (if born)"
              autoCapitalize="words"
              helperText="Leave empty if baby is not yet born"
              containerClassName="mb-6"
            />
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
            {isCreateMode ? "Get Started" : "Save Changes"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
