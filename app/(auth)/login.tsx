import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/stores";
import { sampleUsers } from "../../src/data";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAsDoctor, loginAsMother } = useAuthStore();
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
      // Find doctor profile by user ID
      loginAsDoctor(userId.replace("user-", ""));
    } else {
      loginAsMother(userId.replace("user-", ""));
    }
    router.replace("/");
  };

  const doctors = sampleUsers.filter((u) => u.role === "doctor");
  const mothers = sampleUsers.filter((u) => u.role === "mother");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="py-12">
          <Text className="text-3xl font-bold text-gray-900 text-center">
            Mother's Book
          </Text>
          <Text className="text-base text-gray-500 text-center mt-2">
            Digital Maternal Health Records
          </Text>
        </View>

        {/* Email Login */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Email Address
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Pressable
            className="bg-indigo-600 rounded-lg py-3 mt-4 active:bg-indigo-700"
            onPress={handleLogin}
          >
            <Text className="text-white text-center font-semibold text-base">
              Sign In
            </Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="px-4 text-sm text-gray-500">Quick Login (Demo)</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Quick Login - Doctors */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            Login as Doctor
          </Text>
          {doctors.map((user) => (
            <Pressable
              key={user.id}
              className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-2 active:bg-blue-100"
              onPress={() => handleQuickLogin(user.id, "doctor")}
            >
              <Text className="text-blue-800 font-medium">{user.email}</Text>
            </Pressable>
          ))}
        </View>

        {/* Quick Login - Mothers */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            Login as Mother
          </Text>
          {mothers.map((user) => (
            <Pressable
              key={user.id}
              className="bg-pink-50 border border-pink-200 rounded-lg px-4 py-3 mb-2 active:bg-pink-100"
              onPress={() => handleQuickLogin(user.id, "mother")}
            >
              <Text className="text-pink-800 font-medium">{user.email}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-xs text-gray-400 text-center mb-8">
          Phase 1 - Sample Data Mode
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
