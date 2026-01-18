import { View, Text, TextInput, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import type { KeyboardTypeOptions } from "react-native";

interface VitalInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon: LucideIcon;
  iconColor?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

export function VitalInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon: Icon,
  iconColor = "#14b8a6", // teal-500 default
  keyboardType = "default",
  maxLength,
}: VitalInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon
          size={18}
          color={iconColor}
          strokeWidth={1.5}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#4b5563" // gray-600
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ffffff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#192433",
    borderWidth: 1,
    borderColor: "#324867",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
});
