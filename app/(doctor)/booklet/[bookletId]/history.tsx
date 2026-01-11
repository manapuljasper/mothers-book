import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronLeft, Pill, Edit2, StopCircle } from "lucide-react-native";
import { useState } from "react";
import { useBookletsByDoctor, useMedicationsByBooklet, useUpdateMedication } from "@/hooks";
import { useAuthStore } from "@/stores";
import { CardPressable, LoadingScreen } from "@/components/ui";
import { EditMedicationModal } from "@/components/doctor";
import { MedicationCard } from "@/components";
import type { Medication } from "@/types";

export default function DoctorMedicationHistoryScreen() {
  const { bookletId } = useLocalSearchParams<{ bookletId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doctorProfile } = useAuthStore();

  const { data: doctorBooklets = [], isLoading: bookletLoading } = useBookletsByDoctor(doctorProfile?.id);
  const { data: medications = [], isLoading: medsLoading } = useMedicationsByBooklet(bookletId);
  const updateMedicationMutation = useUpdateMedication();

  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const booklet = doctorBooklets.find((b) => b.id === bookletId);
  const isLoading = bookletLoading || medsLoading;

  // Stop medication
  const handleStopMedication = async (medication: Medication) => {
    Alert.alert(
      "Stop Medication",
      `Are you sure you want to stop ${medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: async () => {
            try {
              await updateMedicationMutation.mutateAsync({
                id: medication.id,
                updates: {
                  endDate: new Date(),
                  isActive: false,
                },
              });
            } catch (error) {
              Alert.alert("Error", "Failed to stop medication. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Update medication
  const handleUpdateMedication = async (updates: Partial<Medication>) => {
    if (!editingMedication) return;
    try {
      await updateMedicationMutation.mutateAsync({
        id: editingMedication.id,
        updates,
      });
      setEditingMedication(null);
    } catch (error) {
      Alert.alert("Error", "Failed to update medication. Please try again.");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const activeMeds = medications.filter((m) => m.isActive);
  const endedMeds = medications.filter((m) => !m.isActive);

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
            <Text className="text-blue-200 mt-1">{booklet.motherName} • {booklet.label}</Text>
          )}
        </View>

        {/* Active Medications Section */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Active Medications ({activeMeds.length})
          </Text>

          {activeMeds.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <Text className="text-gray-400 text-center">No active medications</Text>
            </View>
          ) : (
            <View>
              {activeMeds.map((med) => (
                <View key={med.id} className="mb-3">
                  <MedicationCard
                    medication={med}
                    headerAction={
                      <View className="flex-row">
                        <Pressable
                          onPress={() => setEditingMedication(med)}
                          className="p-2 mr-1 rounded-lg bg-gray-100 dark:bg-gray-700"
                        >
                          <Edit2 size={16} color="#3b82f6" strokeWidth={1.5} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleStopMedication(med)}
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30"
                        >
                          <StopCircle size={16} color="#ef4444" strokeWidth={1.5} />
                        </Pressable>
                      </View>
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Ended Medications Section */}
        {endedMeds.length > 0 && (
          <View className="px-6 mt-6 mb-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Ended Medications ({endedMeds.length})
            </Text>
            <View className="opacity-70">
              {endedMeds.map((med) => (
                <View key={med.id} className="mb-3">
                  <MedicationCard medication={med} />
                </View>
              ))}
            </View>
          </View>
        )}

        {medications.length === 0 && (
          <View className="px-6 mb-8">
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <Text className="text-6xl text-center mb-4">💊</Text>
              <Text className="text-gray-400 text-center">No medications yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Add medications when creating an entry
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Medication Modal */}
      <EditMedicationModal
        visible={!!editingMedication}
        medication={editingMedication}
        onClose={() => setEditingMedication(null)}
        onSave={handleUpdateMedication}
        isSaving={updateMedicationMutation.isPending}
      />
    </SafeAreaView>
  );
}
