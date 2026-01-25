import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { useThemeColors } from '../../theme';

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
  iconColor,
  keyboardType = 'default',
  maxLength,
}: VitalInputProps) {
  const colors = useThemeColors();
  // Use provided iconColor or default to muted gray for monochrome look
  const resolvedIconColor = iconColor ?? colors.textMuted;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Icon
          size={18}
          color={resolvedIconColor}
          strokeWidth={1.5}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
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
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
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
    fontWeight: '500',
  },
});
