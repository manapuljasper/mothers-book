import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stethoscope, Heart } from "lucide-react-native";
import { useSignIn } from "../../src/hooks";
import { useAuthStore } from "../../src/stores";
import { TextField, Button, ListItemPressable } from "../../src/components/ui";

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();
  const selectedRole = useAuthStore((s) => s.selectedRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      await signIn({ email: email.trim(), password });
      router.replace("/");
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
