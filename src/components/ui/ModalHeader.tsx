import { View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
      <View className="flex-1 mr-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      <Pressable onPress={onClose} className="p-2 -mr-2" hitSlop={8}>
        <X size={24} color="#6b7280" strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}
