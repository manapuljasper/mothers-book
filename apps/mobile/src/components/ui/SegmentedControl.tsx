/**
 * Segmented Control
 *
 * A professional segmented toggle control. Supports a "risk" variant
 * with subtle green/red coloring for low/high risk selection.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';

interface Option<T> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Use 'risk' variant for low/high risk toggle with subtle colors */
  variant?: 'default' | 'risk';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'default',
}: SegmentedControlProps<T>) {
  const colors = useThemeColors();

  const getOptionStyles = (optionValue: T, isActive: boolean) => {
    if (!isActive) {
      return {
        backgroundColor: 'transparent',
        textColor: colors.textMuted,
      };
    }

    if (variant === 'risk') {
      if (optionValue === 'low') {
        return {
          backgroundColor: colors.successLight,
          textColor: colors.successMuted,
        };
      }
      if (optionValue === 'high') {
        return {
          backgroundColor: colors.dangerLight,
          textColor: colors.dangerMuted,
        };
      }
    }

    return {
      backgroundColor: colors.accentLight,
      textColor: colors.accent,
    };
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {options.map((option, index) => {
        const isActive = option.value === value;
        const optionStyles = getOptionStyles(option.value, isActive);

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: optionStyles.backgroundColor,
                borderColor: isActive ? colors.border : 'transparent',
              },
              index === 0 && styles.optionFirst,
              index === options.length - 1 && styles.optionLast,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                { color: optionStyles.textColor },
                isActive && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionFirst: {
    marginRight: 2,
  },
  optionLast: {
    marginLeft: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    fontWeight: '600',
  },
});
