import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useThemeStore, useAuthStore } from "../../src/stores";
import { useSignUp } from "../../src/hooks";
import {
  AnimatedView,
  ButtonPressable,
  ListItemPressable,
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

  const inputClass =
    "border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800";

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

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </Text>
              <TextInput
                className={inputClass}
                placeholder={
                  role === "doctor"
                    ? "Dr. Juan Dela Cruz"
                    : "Maria Dela Cruz"
                }
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={fullName}
                onChangeText={setFullName}
                autoComplete="name"
                editable={!isLoading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </Text>
              <TextInput
                className={inputClass}
                placeholder="you@example.com"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </Text>
              <TextInput
                className={inputClass}
                placeholder="At least 6 characters"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                editable={!isLoading}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </Text>
              <TextInput
                className={inputClass}
                placeholder="Re-enter your password"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
                editable={!isLoading}
              />
            </View>

            <ButtonPressable
              className="bg-indigo-600 rounded-lg py-3.5"
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-base">
                  Create Account
                </Text>
              )}
            </ButtonPressable>

            <View className="flex-row justify-center mt-6 mb-8">
              <Text className="text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <ButtonPressable disabled={isLoading}>
                  <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Sign In
                  </Text>
                </ButtonPressable>
              </Link>
            </View>
          </AnimatedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
