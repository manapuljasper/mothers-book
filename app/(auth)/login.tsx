import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignIn } from "../../src/hooks";
import {
  AnimatedView,
  ListItemPressable,
  TextField,
  Button,
} from "../../src/components/ui";

// Test accounts for quick login during development
const TEST_ACCOUNTS = {
  doctors: [{ email: "stinsonmain+1@gmail.com", name: "Doctor Account" }],
  mothers: [{ email: "stinsonmain+2@gmail.com", name: "Patient Patient" }],
};

const TEST_PASSWORD = "123456";

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      await signIn({ email, password });
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (testEmail: string) => {
    setIsLoading(true);
    try {
      await signIn({ email: testEmail, password: TEST_PASSWORD });
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
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
          <TextField
            label="Email Address"
            placeholder="Enter your email"
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
          />

          <View className="mt-6">
            <Button
              variant="indigo"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
            >
              Sign In
            </Button>
          </View>

          <Link href="/(auth)/signup" asChild>
            <ListItemPressable
              className="py-3 mt-2"
              disabled={isLoading}
            >
              <Text className="text-indigo-600 dark:text-indigo-400 text-center font-medium text-base">
                Create Account
              </Text>
            </ListItemPressable>
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
