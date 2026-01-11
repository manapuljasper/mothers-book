import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignUp } from "../../src/hooks";
import { TextField, Button, ListItemPressable } from "../../src/components/ui";

export default function SignupScreen() {
  const router = useRouter();
  const signUp = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
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
      await signUp({ email: email.trim(), password, fullName: name.trim() });
      router.replace("/(auth)/role-select");
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
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
          Sign up to get started
        </Text>

        <TextField
          label="Full Name"
          placeholder="Juan Dela Cruz"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          autoCapitalize="words"
          editable={!isLoading}
          containerClassName="mb-4"
        />

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
      </ScrollView>
    </SafeAreaView>
  );
}
