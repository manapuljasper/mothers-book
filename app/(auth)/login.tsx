import { useState } from "react";
import { View, Text, TextInput, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore, useThemeStore } from "../../src/stores";
import { sampleUsers } from "../../src/data";
import {
  AnimatedView,
  ButtonPressable,
  ListItemPressable,
} from "../../src/components/ui";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAsDoctor, loginAsMother } = useAuthStore();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    const success = login(email);
    if (success) {
      router.replace("/");
    } else {
      Alert.alert("Error", "User not found. Try one of the sample emails below.");
    }
  };

  const handleQuickLogin = (userId: string, role: "doctor" | "mother") => {
    if (role === "doctor") {
      loginAsDoctor(userId.replace("user-", ""));
    } else {
      loginAsMother(userId.replace("user-", ""));
    }
    router.replace("/");
  };

  const doctors = sampleUsers.filter((u) => u.role === "doctor");
  const mothers = sampleUsers.filter((u) => u.role === "mother");

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-6">
        {/* Header with fade in */}
        <AnimatedView entering="fadeDown" delay={0} className="py-12">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            Mother's Book
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center mt-2">
            Digital Maternal Health Records
          </Text>
        </AnimatedView>

        {/* Email Login with fade in */}
        <AnimatedView entering="fadeUp" delay={100} className="mb-8">
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
          />
          <ButtonPressable
            className="bg-indigo-600 rounded-lg py-3 mt-4"
            onPress={handleLogin}
          >
            <Text className="text-white text-center font-semibold text-base">
              Sign In
            </Text>
          </ButtonPressable>
        </AnimatedView>

        {/* Divider */}
        <AnimatedView entering="fade" delay={200} className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <Text className="px-4 text-sm text-gray-500 dark:text-gray-400">
            Quick Login (Demo)
          </Text>
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </AnimatedView>

        {/* Quick Login - Doctors */}
        <View className="mb-6">
          <AnimatedView entering="fade" delay={250}>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Login as Doctor
            </Text>
          </AnimatedView>
          {doctors.map((user) => (
            <ListItemPressable
              key={user.id}
              className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3 mb-2"
              onPress={() => handleQuickLogin(user.id, "doctor")}
            >
              <Text className="text-blue-800 dark:text-blue-300 font-medium">
                {user.email}
              </Text>
            </ListItemPressable>
          ))}
        </View>

        {/* Quick Login - Mothers */}
        <View className="mb-8">
          <AnimatedView entering="fade" delay={300}>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Login as Mother
            </Text>
          </AnimatedView>
          {mothers.map((user) => (
            <ListItemPressable
              key={user.id}
              className="bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded-lg px-4 py-3 mb-2"
              onPress={() => handleQuickLogin(user.id, "mother")}
            >
              <Text className="text-pink-800 dark:text-pink-300 font-medium">
                {user.email}
              </Text>
            </ListItemPressable>
          ))}
        </View>

        <AnimatedView entering="fade" delay={500}>
          <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mb-8">
            Phase 1 - Sample Data Mode
          </Text>
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
}
