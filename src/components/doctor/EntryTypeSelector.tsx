import { ScrollView, Pressable, Text } from "react-native";
import { ENTRY_TYPE_LABELS, type EntryType } from "@/types";

interface EntryTypeSelectorProps {
  value: EntryType;
  onChange: (type: EntryType) => void;
}

export function EntryTypeSelector({ value, onChange }: EntryTypeSelectorProps) {
  return (
    <>
      <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
        Entry Type
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        {(Object.keys(ENTRY_TYPE_LABELS) as EntryType[]).map((type) => (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            className={`px-4 py-2 rounded-full mr-2 border ${
              value === type
                ? "bg-blue-500 border-blue-500"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text
              className={
                value === type
                  ? "text-white font-medium"
                  : "text-gray-600 dark:text-gray-300"
              }
            >
              {ENTRY_TYPE_LABELS[type]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}
