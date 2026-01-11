import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { FlaskConical, Plus, Trash2 } from "lucide-react-native";

export interface PendingLab {
  id: string;
  description: string;
  notes?: string;
  isExisting?: boolean;
}

interface LabRequestFormProps {
  pendingLabs: PendingLab[];
  onAddLab: (lab: Omit<PendingLab, "id">) => void;
  onRemoveLab: (id: string) => void;
}

export function LabRequestForm({
  pendingLabs,
  onAddLab,
  onRemoveLab,
}: LabRequestFormProps) {
  const [currentLab, setCurrentLab] = useState({
    description: "",
    notes: "",
  });

  const handleAddLabToPending = () => {
    if (!currentLab.description) return;
    onAddLab({
      description: currentLab.description,
      notes: currentLab.notes || undefined,
    });
    setCurrentLab({ description: "", notes: "" });
  };

  // Check if there's an unfinished lab form
  const hasUnfinishedLab = currentLab.description.trim() !== "";

  return (
    <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
      <View className="flex-row items-center mb-3">
        <FlaskConical size={18} color="#f59e0b" strokeWidth={1.5} />
        <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
          Lab Requests
        </Text>
      </View>

      {/* Pending labs list */}
      {pendingLabs.length > 0 && (
        <View className="mb-3">
          {pendingLabs.map((lab) => (
            <View
              key={lab.id}
              className="flex-row items-center justify-between bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-2"
            >
              <View className="flex-1">
                <Text className="font-medium text-gray-900 dark:text-white">
                  {lab.description}
                </Text>
                {lab.notes && (
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {lab.notes}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => onRemoveLab(lab.id)}>
                <Trash2 size={18} color="#ef4444" strokeWidth={1.5} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Add lab form */}
      <View className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
        <Text className="text-gray-400 text-xs mb-1">Lab Test</Text>
        <TextInput
          className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 mb-3 text-gray-900 dark:text-white"
          placeholder="e.g., Complete Blood Count (CBC)"
          placeholderTextColor="#9ca3af"
          value={currentLab.description}
          onChangeText={(v) => setCurrentLab({ ...currentLab, description: v })}
        />
        <Text className="text-gray-400 text-xs mb-1">Notes (optional)</Text>
        <TextInput
          className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 mb-3 text-gray-900 dark:text-white"
          placeholder="Additional instructions..."
          placeholderTextColor="#9ca3af"
          value={currentLab.notes}
          onChangeText={(v) => setCurrentLab({ ...currentLab, notes: v })}
        />
        <Pressable
          onPress={handleAddLabToPending}
          disabled={!currentLab.description}
          className={`flex-row items-center justify-center py-2 rounded-lg ${
            currentLab.description ? "bg-amber-500" : "bg-gray-200"
          }`}
        >
          <Plus
            size={16}
            color={currentLab.description ? "white" : "#9ca3af"}
            strokeWidth={1.5}
          />
          <Text
            className={`ml-1 font-medium ${
              currentLab.description ? "text-white" : "text-gray-400"
            }`}
          >
            Add Lab Request
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Export helper to check for unfinished labs
export function hasUnfinishedLabForm(description: string): boolean {
  return description.trim() !== "";
}
