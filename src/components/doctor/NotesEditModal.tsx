import { View, Text, Pressable, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotesEditModalProps {
  visible: boolean;
  onClose: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function NotesEditModal({
  visible,
  onClose,
  notes,
  onNotesChange,
  onSave,
  isSaving,
}: NotesEditModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <Pressable onPress={onClose}>
            <Text className="text-gray-500 dark:text-gray-400">Cancel</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Doctor Notes
          </Text>
          <Pressable onPress={onSave} disabled={isSaving}>
            <Text
              className={`font-semibold ${
                isSaving ? "text-gray-400" : "text-blue-500"
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>
        <View className="flex-1 px-6 py-4">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Add personal notes about this patient's care
          </Text>
          <TextInput
            className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
            placeholder="Enter your notes here..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={onNotesChange}
            autoFocus
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
