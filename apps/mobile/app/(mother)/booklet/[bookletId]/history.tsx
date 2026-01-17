import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, Pill } from "lucide-react-native";
import { useBookletById, useMedicationsByBooklet } from "@/hooks";
import { CardPressable, LoadingScreen } from "@/components/ui";
import { MedicationCard } from "@/components";

export default function MedicationHistoryScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const booklet = useBookletById(bookletId);
  const medications = useMedicationsByBooklet(bookletId) ?? [];

  const isLoading = booklet === undefined || medications === undefined;

  if (isLoading) {
    return <LoadingScreen color="#ec4899" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="bg-blue-500 px-6 py-6" style={{ paddingTop: insets.top }}>
          <CardPressable onPress={() => router.back()} className="flex-row items-center mb-3">
            <ChevronLeft size={20} color="#bfdbfe" strokeWidth={1.5} />
            <Text className="text-blue-200 ml-1">Back</Text>
          </CardPressable>
          <View className="flex-row items-center">
            <Pill size={24} color="#ffffff" strokeWidth={1.5} />
            <Text className="text-white text-2xl font-bold ml-2">Medication History</Text>
          </View>
          {booklet && (
            <Text className="text-blue-200 mt-1">{booklet.label}</Text>
          )}
        </View>

        {/* Medication History Section */}
        <View className="px-6 mt-6 mb-8">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {medications.length} medication{medications.length !== 1 ? "s" : ""} total
          </Text>

          {medications.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <Text className="text-6xl text-center mb-4">💊</Text>
              <Text className="text-gray-400 text-center">No medications yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Medications prescribed by your doctor will appear here
              </Text>
            </View>
          ) : (
            <View>
              {medications.map((med) => (
                <View key={med.id} className="mb-3">
                  <MedicationCard medication={med} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
