import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, FlaskConical, CheckCircle, Paperclip } from "lucide-react-native";
import { useState } from "react";
import { useBookletsByDoctor, useLabsByBooklet, useUpdateLabStatus } from "@/hooks";
import { useAuthStore } from "@/stores";
import { formatDate } from "@/utils";
import { LAB_STATUS_LABELS } from "@/types";
import { CardPressable } from "@/components/ui";

export default function DoctorLabHistoryScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doctorProfile } = useAuthStore();

  const { data: doctorBooklets = [], isLoading: bookletLoading } = useBookletsByDoctor(doctorProfile?.id);
  const { data: labs = [], isLoading: labsLoading } = useLabsByBooklet(bookletId);
  const updateLabMutation = useUpdateLabStatus();

  const [completingLabId, setCompletingLabId] = useState<string | null>(null);
  const [labResults, setLabResults] = useState("");

  const booklet = doctorBooklets.find((b) => b.id === bookletId);
  const isLoading = bookletLoading || labsLoading;

  // Mark lab as complete
  const handleCompleteLab = async (labId: string) => {
    if (!labResults.trim()) {
      Alert.alert("Error", "Please enter the lab results");
      return;
    }
    try {
      await updateLabMutation.mutateAsync({
        id: labId,
        status: "completed",
        results: labResults.trim(),
      });
      setCompletingLabId(null);
      setLabResults("");
    } catch (error) {
      Alert.alert("Error", "Failed to update lab. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  const pendingLabs = labs.filter((l) => l.status === "pending");
  const completedLabs = labs.filter((l) => l.status === "completed");

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
            <Text className="text-purple-200 mt-1">{booklet.motherName} • {booklet.label}</Text>
          )}
        </View>

        {/* Pending Labs Section */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Pending Labs ({pendingLabs.length})
          </Text>

          {pendingLabs.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <Text className="text-gray-400 text-center">No pending labs</Text>
            </View>
          ) : (
            <View>
              {pendingLabs.map((lab) => (
                <View
                  key={lab.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {lab.description}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        Requested: {formatDate(lab.requestedDate)}
                      </Text>
                    </View>
                    <View className="px-2 py-1 rounded-full border border-amber-400">
                      <Text className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        {LAB_STATUS_LABELS[lab.status]}
                      </Text>
                    </View>
                  </View>
                  {lab.notes && (
                    <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      {lab.notes}
                    </Text>
                  )}

                  {/* Complete Lab Section */}
                  {completingLabId === lab.id ? (
                    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">
                        Enter Results:
                      </Text>
                      <TextInput
                        value={labResults}
                        onChangeText={setLabResults}
                        placeholder="Enter lab results..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm mb-3"
                        style={{ textAlignVertical: "top", minHeight: 80 }}
                      />
                      <View className="flex-row">
                        <Pressable
                          onPress={() => {
                            setCompletingLabId(null);
                            setLabResults("");
                          }}
                          className="flex-1 mr-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                        >
                          <Text className="text-gray-600 dark:text-gray-300 text-center font-medium">
                            Cancel
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleCompleteLab(lab.id)}
                          className="flex-1 py-2 rounded-lg bg-green-500"
                        >
                          <Text className="text-white text-center font-medium">
                            Complete
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Pressable
                        onPress={() => setCompletingLabId(lab.id)}
                        className="flex-row items-center flex-1 justify-center py-2 rounded-lg bg-green-50 dark:bg-green-900/30"
                      >
                        <CheckCircle size={16} color="#22c55e" strokeWidth={1.5} />
                        <Text className="text-green-600 dark:text-green-400 font-medium ml-2">
                          Mark Complete
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Completed Labs Section */}
        {completedLabs.length > 0 && (
          <View className="px-6 mt-6 mb-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Completed Labs ({completedLabs.length})
            </Text>
            <View>
              {completedLabs.map((lab) => (
                <View
                  key={lab.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {lab.description}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        Requested: {formatDate(lab.requestedDate)}
                      </Text>
                    </View>
                    <View className="px-2 py-1 rounded-full border border-green-400">
                      <Text className="text-xs font-medium text-green-600 dark:text-green-400">
                        {LAB_STATUS_LABELS[lab.status]}
                      </Text>
                    </View>
                  </View>
                  {lab.results && (
                    <View className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Text className="text-green-600 dark:text-green-400 text-sm">
                        <Text className="font-medium">Results: </Text>
                        {lab.results}
                      </Text>
                    </View>
                  )}
                  {lab.completedDate && (
                    <Text className="text-gray-400 text-xs mt-2">
                      Completed: {formatDate(lab.completedDate)}
                    </Text>
                  )}
                  {/* Add Attachment Button */}
                  <Pressable
                    onPress={() => {
                      // Attachment functionality not implemented yet
                    }}
                    className="flex-row items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"
                  >
                    <Paperclip size={14} color="#a855f7" strokeWidth={1.5} />
                    <Text className="text-purple-500 text-sm font-medium ml-2">
                      Add Attachment
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {labs.length === 0 && (
          <View className="px-6 mb-8">
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <Text className="text-6xl text-center mb-4">🧪</Text>
              <Text className="text-gray-400 text-center">No lab requests yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Add lab requests when creating an entry
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
