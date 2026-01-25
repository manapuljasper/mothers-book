import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp, useSignOut } from "../../src/hooks";
import { useAuthStore } from "../../src/stores";
import { Button, ListItemPressable } from "../../src/components/ui";
import {
  FormTextField,
  FormDatePicker,
  FormRoleSelector,
} from "../../src/components/form";
import { signupSchema, SignupFormData } from "../../src/utils/validation";

export default function SignupScreen() {
  const router = useRouter();
  const signUp = useSignUp();
  const signOut = useSignOut();
  const { isSignedIn } = useAuth();
  const setSelectedRole = useAuthStore((s) => s.setSelectedRole);
  const setPendingBirthdate = useAuthStore((s) => s.setPendingBirthdate);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: undefined,
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      birthdate: null,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const role = watch("role");
  const isMother = role === "mother";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/(auth)/welcome");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  // If already signed in, show option to continue or sign out
  if (isSignedIn) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
            You're already signed in
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Continue to the app or sign out to use a different account.
          </Text>
          <Button
            variant="primary"
            onPress={() => router.replace("/")}
            fullWidth
          >
            Continue to App
          </Button>
          <View className="h-3" />
          <Button
            variant="outline"
            onPress={handleSignOut}
            loading={isSigningOut}
            fullWidth
          >
            Sign Out
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const onSubmit = async (data: SignupFormData) => {
    // Role is guaranteed to be defined after validation
    if (!data.role) return;

    try {
      const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
      // Set the role in store before signup so it's available for user creation
      setSelectedRole(data.role);
      await signUp({ email: data.email.trim(), password: data.password, fullName });
      // Store birthdate for mother profile creation
      if (data.role === "mother" && data.birthdate) {
        setPendingBirthdate(data.birthdate.getTime());
      }
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="py-8"
      >
        <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Create Account
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Select your role to get started
        </Text>

        {/* Role Selection */}
        <View className="mb-6">
          <FormRoleSelector
            control={control}
            name="role"
            disabled={isSubmitting}
          />
        </View>

        {/* Form Fields */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <FormTextField
              control={control}
              name="firstName"
              label="First Name"
              placeholder="Juan"
              autoComplete="given-name"
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>
          <View className="flex-1">
            <FormTextField
              control={control}
              name="lastName"
              label="Last Name"
              placeholder="Dela Cruz"
              autoComplete="family-name"
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>
        </View>

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
          placeholder="At least 8 characters"
          secureTextEntry
          autoComplete="new-password"
          editable={!isSubmitting}
          containerClassName="mb-4"
        />

        {/* Date of Birth - only for mothers */}
        {isMother && (
          <View className="mb-6">
            <FormDatePicker
              control={control}
              name="birthdate"
              label="Date of Birth"
              required
              placeholder="Select your date of birth"
              variant="selected"
              selectedColor="pink"
              maximumDate={new Date()}
            />
          </View>
        )}

        {!isMother && <View className="mb-2" />}

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
        >
          Sign Up
        </Button>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <ListItemPressable>
              <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                Sign In
              </Text>
            </ListItemPressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
