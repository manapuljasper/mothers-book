import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stethoscope, Heart } from "lucide-react-native";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "../../src/stores";

type Role = "doctor" | "mother";

export default function RoleSelectScreen() {
  const router = useRouter();
  const setSelectedRole = useAuthStore((s) => s.setSelectedRole);
  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const [isLoading, setIsLoading] = useState(false);

  const selectRole = async (role: Role) => {
    setIsLoading(true);
    try {
      // Update role in backend
      await createOrGetUser({ role });
      // Update local store
      setSelectedRole(role);
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to set role"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Continue as...
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-10">
          Select how you want to use the app
        </Text>

        <Pressable
          className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-4 active:opacity-80"
          onPress={() => selectRole("doctor")}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.6 : 1 }}
        >
          <View className="flex-row items-center mb-2">
            <Stethoscope size={28} color="#2563eb" />
            <Text className="text-xl font-semibold text-blue-700 dark:text-blue-300 ml-3">
              Healthcare Provider
            </Text>
          </View>
          <Text className="text-blue-600 dark:text-blue-400">
            Manage patient records and consultations
          </Text>
        </Pressable>

        <Pressable
          className="bg-pink-50 dark:bg-pink-900/30 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6 active:opacity-80"
          onPress={() => selectRole("mother")}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.6 : 1 }}
        >
          <View className="flex-row items-center mb-2">
            <Heart size={28} color="#db2777" />
            <Text className="text-xl font-semibold text-pink-700 dark:text-pink-300 ml-3">
              Patient
            </Text>
          </View>
          <Text className="text-pink-600 dark:text-pink-400">
            Track your pregnancy and health records
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
