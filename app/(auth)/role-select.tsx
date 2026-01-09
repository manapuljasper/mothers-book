import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          Welcome to Mother's Book
        </Text>
        <Text className="text-base text-gray-500 text-center mb-12">
          Select your role to continue
        </Text>

        <Pressable
          className="bg-blue-600 rounded-xl py-4 mb-4 active:bg-blue-700"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-white text-center font-semibold text-lg">
            I'm a Doctor
          </Text>
          <Text className="text-blue-200 text-center text-sm mt-1">
            Manage patient records
          </Text>
        </Pressable>

        <Pressable
          className="bg-pink-600 rounded-xl py-4 active:bg-pink-700"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-white text-center font-semibold text-lg">
            I'm a Mother
          </Text>
          <Text className="text-pink-200 text-center text-sm mt-1">
            Track my pregnancy journey
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
