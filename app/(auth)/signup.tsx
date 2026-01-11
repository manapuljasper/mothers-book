import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useThemeStore, useAuthStore } from "../../src/stores";
import { useSignUp } from "../../src/hooks";
import {
  AnimatedView,
  ButtonPressable,
  ListItemPressable,
  TextField,
  Button,
} from "../../src/components/ui";
import type { UserRole } from "../../src/types";

type Step = "role" | "details";

export default function SignupScreen() {
  const router = useRouter();
  const { isLoading } = useAuthStore();
  const signUpMutation = useSignUp();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep("details");
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("role");
    } else {
      router.back();
    }
  };

  const handleSignUp = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    if (!role) {
      Alert.alert("Error", "Please select a role");
      return;
    }

    const result = await signUpMutation.mutateAsync({
      email,
      password,
      role,
      fullName,
    });
    if (result.success) {
      router.replace("/");
    } else {
      Alert.alert("Error", result.error || "Failed to create account");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2">
        <ButtonPressable onPress={handleBack} className="p-2 -ml-2">
          <ChevronLeft
            size={24}
            color={isDark ? "#9ca3af" : "#6b7280"}
          />
        </ButtonPressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
          Create Account
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        {step === "role" ? (
          <AnimatedView entering="fadeUp" delay={0}>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
              I am a...
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mb-8">
              Select your role to get started
            </Text>

            <ListItemPressable
              className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-4"
              onPress={() => handleRoleSelect("doctor")}
            >
              <Text className="text-xl font-semibold text-blue-800 dark:text-blue-300">
                Healthcare Provider
              </Text>
              <Text className="text-blue-600 dark:text-blue-400 mt-2">
                I'm a doctor, midwife, or healthcare professional who wants to
                manage patient records
              </Text>
            </ListItemPressable>

            <ListItemPressable
              className="bg-pink-50 dark:bg-pink-900/30 border-2 border-pink-200 dark:border-pink-700 rounded-xl p-6 mb-4"
              onPress={() => handleRoleSelect("mother")}
            >
              <Text className="text-xl font-semibold text-pink-800 dark:text-pink-300">
                Mother / Parent
              </Text>
              <Text className="text-pink-600 dark:text-pink-400 mt-2">
                I'm pregnant or a new mother who wants to track my maternal
                health journey
              </Text>
            </ListItemPressable>
          </AnimatedView>
        ) : (
          <AnimatedView entering="fadeUp" delay={0}>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
              {role === "doctor" ? "Doctor Details" : "Your Details"}
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mb-6">
              Fill in your information to create your account
            </Text>

            <TextField
              label="Full Name"
              placeholder={
                role === "doctor" ? "Dr. Juan Dela Cruz" : "Maria Dela Cruz"
              }
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
              editable={!isLoading}
              containerClassName="mb-4"
            />

            <TextField
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
              containerClassName="mb-4"
            />

            <TextField
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
              containerClassName="mb-4"
            />

            <TextField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
              containerClassName="mb-6"
            />

            <Button
              variant="indigo"
              onPress={handleSignUp}
              loading={isLoading}
              fullWidth
            >
              Create Account
            </Button>

            <View className="flex-row justify-center mt-6 mb-8">
              <Text className="text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <ListItemPressable disabled={isLoading}>
                  <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Sign In
                  </Text>
                </ListItemPressable>
              </Link>
            </View>
          </AnimatedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
