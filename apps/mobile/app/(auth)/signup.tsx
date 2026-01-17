import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stethoscope, Heart } from "lucide-react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useSignUp, useSignOut } from "../../src/hooks";
import { useAuthStore } from "../../src/stores";
import { TextField, Button, ListItemPressable } from "../../src/components/ui";

export default function SignupScreen() {
  const router = useRouter();
  const signUp = useSignUp();
  const signOut = useSignOut();
  const { isSignedIn } = useAuth();
  const selectedRole = useAuthStore((s) => s.selectedRole);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDoctor = selectedRole === "doctor";
  const roleLabel = isDoctor ? "Healthcare Provider" : "Patient";
  const RoleIcon = isDoctor ? Stethoscope : Heart;
  const roleColor = isDoctor ? "#2563eb" : "#db2777";

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

  const handleSignUp = async () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await signUp({ email: email.trim(), password, fullName });
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
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
              Sign up as {roleLabel}
            </Text>
          </View>
        )}

        {!selectedRole && (
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Sign up to get started
          </Text>
        )}

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <TextField
              label="First Name"
              placeholder="Juan"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="given-name"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Last Name"
              placeholder="Dela Cruz"
              value={lastName}
              onChangeText={setLastName}
              autoComplete="family-name"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>
        </View>

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
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          editable={!isLoading}
          containerClassName="mb-6"
        />

        <Button
          variant="primary"
          onPress={handleSignUp}
          loading={isLoading}
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
