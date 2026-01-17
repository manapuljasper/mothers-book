import { useState, useRef } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stethoscope, Heart, ArrowLeft, Mail } from "lucide-react-native";
import { useSignIn, SignInResult } from "../../src/hooks";
import { useAuthStore } from "../../src/stores";
import { TextField, Button, ListItemPressable } from "../../src/components/ui";

type SecondFactorFns = Extract<SignInResult, { status: "needs_second_factor" }>;

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();
  const selectedRole = useAuthStore((s) => s.selectedRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Second factor state
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const secondFactorFns = useRef<SecondFactorFns | null>(null);

  const isDoctor = selectedRole === "doctor";
  const roleLabel = isDoctor ? "Healthcare Provider" : "Patient";
  const RoleIcon = isDoctor ? Stethoscope : Heart;
  const roleColor = isDoctor ? "#2563eb" : "#db2777";

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn({ email: email.trim(), password });

      if (result.status === "complete") {
        router.replace("/");
      } else if (result.status === "needs_second_factor") {
        // Store the second factor functions
        secondFactorFns.current = result;
        // Send verification code immediately
        await result.prepareSecondFactor();
        setNeedsSecondFactor(true);
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    if (!secondFactorFns.current) {
      Alert.alert("Error", "Session expired. Please sign in again.");
      handleBackToLogin();
      return;
    }

    setIsLoading(true);
    try {
      await secondFactorFns.current.attemptSecondFactor(verificationCode.trim());
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error instanceof Error ? error.message : "Invalid code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!secondFactorFns.current) {
      Alert.alert("Error", "Session expired. Please sign in again.");
      handleBackToLogin();
      return;
    }

    setIsLoading(true);
    try {
      await secondFactorFns.current.prepareSecondFactor();
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setNeedsSecondFactor(false);
    setVerificationCode("");
    secondFactorFns.current = null;
  };

  // Verification code UI
  if (needsSecondFactor) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="py-8"
        >
          <ListItemPressable onPress={handleBackToLogin} className="mb-6">
            <View className="flex-row items-center">
              <ArrowLeft size={20} color="#6b7280" />
              <Text className="ml-2 text-gray-500 dark:text-gray-400">
                Back to login
              </Text>
            </View>
          </ListItemPressable>

          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mb-4">
              <Mail size={32} color="#6366f1" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Check your email
            </Text>
          </View>

          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            We sent a verification code to{"\n"}
            <Text className="font-medium text-gray-700 dark:text-gray-300">
              {email}
            </Text>
          </Text>

          <TextField
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            editable={!isLoading}
            containerClassName="mb-6"
            maxLength={6}
          />

          <Button
            variant="primary"
            onPress={handleVerifyCode}
            loading={isLoading}
            fullWidth
          >
            Verify
          </Button>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 dark:text-gray-400">
              Didn't receive the code?{" "}
            </Text>
            <ListItemPressable onPress={handleResendCode} disabled={isLoading}>
              <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                Resend
              </Text>
            </ListItemPressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Login form UI
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="py-8"
      >
        <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Welcome Back
        </Text>

        {selectedRole && (
          <View className="flex-row items-center justify-center mb-6">
            <RoleIcon size={20} color={roleColor} />
            <Text
              className={`ml-2 font-medium ${
                isDoctor
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-pink-600 dark:text-pink-400"
              }`}
            >
              Sign in as {roleLabel}
            </Text>
          </View>
        )}

        {!selectedRole && (
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Sign in to continue
          </Text>
        )}

        <TextField
          label="Email"
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
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          editable={!isLoading}
          containerClassName="mb-6"
        />

        <Button
          variant="primary"
          onPress={handleLogin}
          loading={isLoading}
          fullWidth
        >
          Sign In
        </Button>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <ListItemPressable>
              <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                Sign Up
              </Text>
            </ListItemPressable>
          </Link>
        </View>

        {selectedRole && (
          <View className="flex-row justify-center mt-4">
            <Link href="/(auth)/welcome" asChild>
              <ListItemPressable>
                <Text className="text-gray-500 dark:text-gray-400">
                  Switch role
                </Text>
              </ListItemPressable>
            </Link>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
