import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { QrCode } from "lucide-react-native";
import { useAuthStore, useThemeStore } from "@/stores";
import { useGrantDoctorAccess } from "@/hooks";

export default function ScanQRScreen() {
  const router = useRouter();
  const { doctorProfile } = useAuthStore();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const [manualCode, setManualCode] = useState("");

  const grantAccessMutation = useGrantDoctorAccess();

  const handleManualEntry = async () => {
    if (!manualCode.trim()) {
      Alert.alert("Error", "Please enter a booklet ID");
      return;
    }

    if (!doctorProfile) {
      Alert.alert("Error", "Doctor profile not found");
      return;
    }

    try {
      const bookletId = manualCode.trim();
      await grantAccessMutation.mutateAsync({
        bookletId,
        doctorId: doctorProfile.id,
      });

      setManualCode("");
      router.push(`/(doctor)/booklet/${bookletId}`);
    } catch (error: any) {
      console.log("Grant access error:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to grant access. Check the booklet ID."
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-6 py-4">
      {/* Camera Placeholder */}
      <View className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-square items-center justify-center mb-8">
        <QrCode
          size={64}
          color={isDark ? "#6b7280" : "#9ca3af"}
          strokeWidth={1}
        />
        <Text className="text-gray-500 dark:text-gray-400 text-center mt-4">
          Camera preview will appear here
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-2">
          (QR scanning coming soon)
        </Text>
      </View>

      {/* Manual Entry */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <Text className="font-semibold text-gray-900 dark:text-white mb-4">
          Manual Entry (Dev Mode)
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Enter the booklet UUID from the mother's QR code:
        </Text>
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mb-4 text-gray-900 dark:text-white font-mono text-sm"
          placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
          placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          className={`rounded-lg py-3 ${
            grantAccessMutation.isPending
              ? "bg-blue-400"
              : "bg-blue-600 active:bg-blue-700"
          }`}
          onPress={handleManualEntry}
          disabled={grantAccessMutation.isPending}
        >
          {grantAccessMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">
              Grant Access
            </Text>
          )}
        </Pressable>
      </View>

      {/* Instructions */}
      <View className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
        <Text className="text-blue-800 dark:text-blue-300 font-medium mb-2">
          How to get a Booklet ID:
        </Text>
        <Text className="text-blue-600 dark:text-blue-400 text-sm">
          1. Ask the mother to open their booklet{"\n"}
          2. Copy the UUID from the URL or QR code{"\n"}
          3. Paste it above to gain access
        </Text>
      </View>
    </ScrollView>
  );
}
