import { useRef } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn, SignInResult } from "../../src/hooks";
import { Button, ListItemPressable } from "../../src/components/ui";
import { FormTextField } from "../../src/components/form";
import {
  loginSchema,
  LoginFormData,
  verificationCodeSchema,
  VerificationCodeFormData,
} from "../../src/utils/validation";

type SecondFactorFns = Extract<SignInResult, { status: "needs_second_factor" }>;

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();

  // Login form
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Verification code form
  const {
    control: verifyControl,
    handleSubmit: handleVerifySubmit,
    formState: { isSubmitting: isVerifying },
    reset: resetVerifyForm,
  } = useForm<VerificationCodeFormData>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { code: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Second factor state
  const secondFactorFns = useRef<SecondFactorFns | null>(null);
  const needsSecondFactor = secondFactorFns.current !== null;

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn({ email: data.email.trim(), password: data.password });

      if (result.status === "complete") {
        router.replace("/");
      } else if (result.status === "needs_second_factor") {
        // Store the second factor functions
        secondFactorFns.current = result;
        // Send verification code immediately
        await result.prepareSecondFactor();
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  const onVerifySubmit = async (data: VerificationCodeFormData) => {
    if (!secondFactorFns.current) {
      Alert.alert("Error", "Session expired. Please sign in again.");
      handleBackToLogin();
      return;
    }

    try {
      await secondFactorFns.current.attemptSecondFactor(data.code.trim());
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error instanceof Error ? error.message : "Invalid code. Please try again."
      );
    }
  };

  const handleResendCode = async () => {
    if (!secondFactorFns.current) {
      Alert.alert("Error", "Session expired. Please sign in again.");
      handleBackToLogin();
      return;
    }

    try {
      await secondFactorFns.current.prepareSecondFactor();
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send code. Please try again."
      );
    }
  };

  const handleBackToLogin = () => {
    secondFactorFns.current = null;
    resetVerifyForm();
  };

  // Verification code UI
  if (needsSecondFactor) {
    const email = getValues("email");

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

          <FormTextField
            control={verifyControl}
            name="code"
            label="Verification Code"
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            editable={!isVerifying}
            containerClassName="mb-6"
            maxLength={6}
          />

          <Button
            variant="primary"
            onPress={handleVerifySubmit(onVerifySubmit)}
            loading={isVerifying}
            fullWidth
          >
            Verify
          </Button>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 dark:text-gray-400">
              Didn't receive the code?{" "}
            </Text>
            <ListItemPressable onPress={handleResendCode} disabled={isVerifying}>
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

        <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
          Sign in to continue
        </Text>

        <FormTextField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!isSubmitting}
          containerClassName="mb-4"
        />

        <FormTextField
          control={control}
          name="password"
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          autoComplete="password"
          editable={!isSubmitting}
          containerClassName="mb-6"
        />

        <Button
          variant="primary"
          onPress={handleSubmit(onLoginSubmit)}
          loading={isSubmitting}
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
      </ScrollView>
    </SafeAreaView>
  );
}
