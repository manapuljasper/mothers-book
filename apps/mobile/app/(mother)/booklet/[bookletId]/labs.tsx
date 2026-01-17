import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, FlaskConical, Paperclip } from "lucide-react-native";
import { useBookletById, useLabsByBooklet } from "@/hooks";
import { CardPressable, LoadingScreen } from "@/components/ui";
import { LabRequestCard } from "@/components";

export default function LabHistoryScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const booklet = useBookletById(bookletId);
  const labs = useLabsByBooklet(bookletId) ?? [];

  const isLoading = booklet === undefined || labs === undefined;

  if (isLoading) {
    return <LoadingScreen color="#ec4899" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-purple-500" edges={[]}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="bg-purple-500 px-6 py-6" style={{ paddingTop: insets.top }}>
          <CardPressable onPress={() => router.back()} className="flex-row items-center mb-3">
            <ChevronLeft size={20} color="#e9d5ff" strokeWidth={1.5} />
            <Text className="text-purple-200 ml-1">Back</Text>
          </CardPressable>
          <View className="flex-row items-center">
            <FlaskConical size={24} color="#ffffff" strokeWidth={1.5} />
            <Text className="text-white text-2xl font-bold ml-2">Lab History</Text>
          </View>
          {booklet && (
            <Text className="text-purple-200 mt-1">{booklet.label}</Text>
          )}
        </View>

        {/* Lab History Section */}
        <View className="px-6 mt-6 mb-8">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {labs.length} lab request{labs.length !== 1 ? "s" : ""} total
          </Text>

          {labs.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <Text className="text-6xl text-center mb-4">🧪</Text>
              <Text className="text-gray-400 text-center">No lab requests yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Lab requests from your doctor will appear here
              </Text>
            </View>
          ) : (
            <View>
              {labs.map((lab) => (
                <View key={lab.id} className="mb-3">
                  <LabRequestCard
                    lab={lab}
                    action={
                      <Pressable
                        onPress={() => {
                          // Attachment functionality not implemented yet
                        }}
                        className="flex-row items-center"
                      >
                        <Paperclip size={14} color="#a855f7" strokeWidth={1.5} />
                        <Text className="text-purple-500 text-sm font-medium ml-2">
                          Add Attachment
                        </Text>
                      </Pressable>
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
