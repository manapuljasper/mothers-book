import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
          MaternaMD
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-10">
          Digital Mother's Book for maternal health records
        </Text>

        <Button
          variant="primary"
          onPress={() => router.push("/(auth)/signup")}
          fullWidth
        >
          Create Account
        </Button>

        <View className="h-3" />

        <Button
          variant="outline"
          onPress={() => router.push("/(auth)/login")}
          fullWidth
        >
          Sign In
        </Button>
      </View>
    </SafeAreaView>
  );
}
