import { View, Text, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { useAuthStore, useBookletStore, useThemeStore } from "../../../src/stores";

export default function ScanQRScreen() {
  const { doctorProfile } = useAuthStore();
  const { grantAccess, getBookletById } = useBookletStore();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const [manualCode, setManualCode] = useState("");

  // Simulated QR scan - in Phase 1, we use manual input
  const handleManualEntry = () => {
    if (!manualCode.trim()) {
      Alert.alert("Error", "Please enter a booklet ID");
      return;
    }

    const booklet = getBookletById(manualCode.trim());
    if (!booklet) {
      Alert.alert("Error", "Booklet not found. Try: book-001, book-003, or book-004");
      return;
    }

    if (!doctorProfile) {
      Alert.alert("Error", "Doctor profile not found");
      return;
    }

    grantAccess(booklet.id, doctorProfile.id);
    Alert.alert(
      "Success",
      `Access granted to "${booklet.label}". The patient will now appear in your patient list.`
    );
    setManualCode("");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-6 py-4">
      {/* Camera Placeholder */}
      <View className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-square items-center justify-center mb-8">
        <Text className="text-6xl mb-4">📷</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          Camera preview will appear here
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-2">
          (Not available in Phase 1)
        </Text>
      </View>

      {/* Manual Entry */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <Text className="font-semibold text-gray-900 dark:text-white mb-4">
          Manual Entry (Demo Mode)
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          For testing, enter a booklet ID directly:
        </Text>
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mb-4 text-gray-900 dark:text-white"
          placeholder="e.g., book-001"
          placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="none"
        />
        <Pressable
          className="bg-blue-600 rounded-lg py-3 active:bg-blue-700"
          onPress={handleManualEntry}
        >
          <Text className="text-white text-center font-semibold">
            Grant Access
          </Text>
        </Pressable>
      </View>

      {/* Sample Booklet IDs */}
      <View className="mt-6">
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          Sample Booklet IDs:
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          book-001 (Maria - Active), book-003 (Anna), book-004 (Sofia)
        </Text>
      </View>
    </ScrollView>
  );
}
