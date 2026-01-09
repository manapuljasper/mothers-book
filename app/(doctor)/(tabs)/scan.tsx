import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore, useBookletStore } from "../../../src/stores";

export default function ScanQRScreen() {
  const { doctorProfile } = useAuthStore();
  const { grantAccess, getBookletById } = useBookletStore();
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Scan QR Code</Text>
        <Text className="text-gray-500 text-sm">
          Scan a patient's QR code to access their booklet
        </Text>
      </View>

      <View className="flex-1 px-6 py-8">
        {/* Camera Placeholder */}
        <View className="bg-gray-200 rounded-2xl aspect-square items-center justify-center mb-8">
          <Text className="text-6xl mb-4">📷</Text>
          <Text className="text-gray-500 text-center">
            Camera preview will appear here
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            (Not available in Phase 1)
          </Text>
        </View>

        {/* Manual Entry */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="font-semibold text-gray-900 mb-4">
            Manual Entry (Demo Mode)
          </Text>
          <Text className="text-gray-500 text-sm mb-4">
            For testing, enter a booklet ID directly:
          </Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            placeholder="e.g., book-001"
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
          <Text className="text-gray-500 text-sm mb-2">Sample Booklet IDs:</Text>
          <Text className="text-gray-400 text-xs">
            book-001 (Maria - Active), book-003 (Anna), book-004 (Sofia)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
