import { useState } from "react";
import { View, Text, Platform } from "react-native";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DatePickerButton } from "../ui";

interface FormDatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  variant?: "default" | "selected";
  selectedColor?: "blue" | "green" | "pink";
  size?: "sm" | "md";
  maximumDate?: Date;
  minimumDate?: Date;
}

/**
 * DatePicker integrated with react-hook-form
 * Manages picker visibility internally and displays validation errors
 */
export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  required,
  placeholder = "Select date",
  variant = "default",
  selectedColor = "blue",
  size = "md",
  maximumDate,
  minimumDate,
}: FormDatePickerProps<T>) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const dateValue = value as Date | null | undefined;

        const handleDateChange = (_: unknown, selectedDate?: Date) => {
          setShowPicker(Platform.OS === "ios");
          if (selectedDate) {
            onChange(selectedDate);
          }
        };

        return (
          <View>
            <DatePickerButton
              label={label}
              required={required}
              value={dateValue}
              onPress={() => setShowPicker(true)}
              onClear={() => onChange(null)}
              placeholder={placeholder}
              variant={variant}
              selectedColor={selectedColor}
              size={size}
            />

            {error?.message && (
              <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
                {error.message}
              </Text>
            )}

            {showPicker && (
              <DateTimePicker
                value={dateValue || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
              />
            )}
          </View>
        );
      }}
    />
  );
}
