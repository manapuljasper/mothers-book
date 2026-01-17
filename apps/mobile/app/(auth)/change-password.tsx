import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Lock, ShieldCheck } from "lucide-react-native";
import { TextField, Button } from "../../src/components/ui";
import { useCurrentUser } from "../../src/hooks";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const currentUser = useCurrentUser();
  const clearPasswordChangeFlag = useMutation(api.users.clearPasswordChangeFlag);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (newPassword === currentPassword && newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    if (!clerkUser) {
      Alert.alert("Error", "User not found");
      return;
    }

    setIsLoading(true);
    try {
      // Update password using Clerk
      await clerkUser.updatePassword({
        currentPassword,
        newPassword,
      });

      // Clear the requiresPasswordChange flag in Convex
      await clearPasswordChangeFlag();

      Alert.alert(
        "Password Changed",
        "Your password has been updated successfully.",
        [
          {
            text: "Continue",
            onPress: () => {
              // Navigate to the main app
              router.replace("/");
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error?.errors?.[0]?.message || error?.message || "Failed to change password";
      if (errorMessage.includes("incorrect")) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Current password is incorrect",
        }));
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || currentUser === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="py-8"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-full mb-4">
            <ShieldCheck size={40} color="#db2777" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Change Your Password
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-2 px-4">
            Your account was created by your healthcare provider. Please set a new secure password.
          </Text>
        </View>

        {/* Info box */}
        <View className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6 flex-row items-start">
          <Lock size={20} color="#f59e0b" className="mt-0.5" />
          <View className="ml-3 flex-1">
            <Text className="text-amber-800 dark:text-amber-200 text-sm">
              Use the temporary password that was sent to your email as the current password.
            </Text>
          </View>
        </View>

        {/* Form */}
        <TextField
          label="Current Password"
          placeholder="Enter your temporary password"
          value={currentPassword}
          onChangeText={(text) => {
            setCurrentPassword(text);
            setErrors((prev) => ({ ...prev, currentPassword: "" }));
          }}
          secureTextEntry
          autoComplete="password"
          editable={!isLoading}
          error={errors.currentPassword}
          containerClassName="mb-4"
        />

        <TextField
          label="New Password"
          placeholder="Enter your new password"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setErrors((prev) => ({ ...prev, newPassword: "" }));
          }}
          secureTextEntry
          autoComplete="new-password"
          editable={!isLoading}
          error={errors.newPassword}
          helperText={!errors.newPassword ? "Must be at least 8 characters" : undefined}
          containerClassName="mb-4"
        />

        <TextField
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          secureTextEntry
          autoComplete="new-password"
          editable={!isLoading}
          error={errors.confirmPassword}
          containerClassName="mb-6"
        />

        <Button
          variant="primary"
          onPress={handleChangePassword}
          loading={isLoading}
          fullWidth
        >
          Change Password
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
