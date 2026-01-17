import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignIn } from "../../src/hooks";
import { TextField, Button, ListItemPressable } from "../../src/components/ui";

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      await signIn({ email: email.trim(), password });
      router.replace("/(auth)/role-select");
    } catch (error) {
      Alert.alert(
        "Login Failed",
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
          Welcome Back
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
          Sign in to continue
        </Text>

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
      </ScrollView>
    </SafeAreaView>
  );
}
