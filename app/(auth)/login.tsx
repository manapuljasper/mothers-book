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
import { useThemeStore, useAuthStore } from "../../src/stores";
import { useSignIn } from "../../src/hooks";
import {
  AnimatedView,
  ButtonPressable,
  ListItemPressable,
} from "../../src/components/ui";

// Test accounts for quick login during development
const TEST_ACCOUNTS = {
  doctors: [{ email: "stinsonmain+1@gmail.com", name: "Doctor Account" }],
  mothers: [{ email: "stinsonmain+2@gmail.com", name: "Patient Patient" }],
};

const TEST_PASSWORD = "123456";

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading } = useAuthStore();
  const signInMutation = useSignIn();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    const result = await signInMutation.mutateAsync({ email, password });
    if (result.success) {
      router.replace("/");
    } else {
      console.log("result", result);
      Alert.alert("Error", result.error || "Failed to sign in");
    }
  };

  const handleQuickLogin = async (testEmail: string) => {
    const result = await signInMutation.mutateAsync({
      email: testEmail,
      password: TEST_PASSWORD,
    });
    if (result.success) {
      router.replace("/");
    } else {
      console.log("result", result);
      Alert.alert("Error", result.error || "Failed to sign in");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <AnimatedView entering="fadeDown" delay={0} className="py-12">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            Mother's Book
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center mt-2">
            Digital Maternal Health Records
          </Text>
        </AnimatedView>

        {/* Login Form */}
        <AnimatedView entering="fadeUp" delay={100} className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            placeholder="Enter your email"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
            Password
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            placeholder="Enter your password"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            editable={!isLoading}
          />

          <ButtonPressable
            className="bg-indigo-600 rounded-lg py-3 mt-6"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Sign In
              </Text>
            )}
          </ButtonPressable>

          <Link href="/(auth)/signup" asChild>
            <ButtonPressable className="py-3 mt-2" disabled={isLoading}>
              <Text className="text-indigo-600 dark:text-indigo-400 text-center font-medium text-base">
                Create Account
              </Text>
            </ButtonPressable>
          </Link>
        </AnimatedView>

        {/* Divider */}
        <AnimatedView
          entering="fade"
          delay={200}
          className="flex-row items-center mb-6"
        >
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <Text className="px-4 text-sm text-gray-500 dark:text-gray-400">
            Quick Login (Demo)
          </Text>
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </AnimatedView>

        {/* Quick Login - Doctors */}
        <View className="mb-4">
          <AnimatedView entering="fade" delay={250}>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Login as Doctor
            </Text>
          </AnimatedView>
          {TEST_ACCOUNTS.doctors.map((account) => (
            <ListItemPressable
              key={account.email}
              className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3 mb-2"
              onPress={() => handleQuickLogin(account.email)}
              disabled={isLoading}
            >
              <Text className="text-blue-800 dark:text-blue-300 font-medium">
                {account.name}
              </Text>
              <Text className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                {account.email}
              </Text>
            </ListItemPressable>
          ))}
        </View>

        {/* Quick Login - Mothers */}
        <View className="mb-6">
          <AnimatedView entering="fade" delay={300}>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Login as Mother
            </Text>
          </AnimatedView>
          {TEST_ACCOUNTS.mothers.map((account) => (
            <ListItemPressable
              key={account.email}
              className="bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded-lg px-4 py-3 mb-2"
              onPress={() => handleQuickLogin(account.email)}
              disabled={isLoading}
            >
              <Text className="text-pink-800 dark:text-pink-300 font-medium">
                {account.name}
              </Text>
              <Text className="text-pink-600 dark:text-pink-400 text-xs mt-0.5">
                {account.email}
              </Text>
            </ListItemPressable>
          ))}
        </View>

        <AnimatedView entering="fade" delay={500}>
          <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mb-8">
            Test password for demo accounts: {TEST_PASSWORD}
          </Text>
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
}
