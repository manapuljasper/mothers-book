import { View, Text, Pressable } from "react-native";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Stethoscope, Heart, Check } from "lucide-react-native";

type Role = "doctor" | "mother";

interface FormRoleSelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
}

/**
 * Role selector for signup form integrated with react-hook-form
 * Displays doctor/mother toggle with visual selection state
 */
export function FormRoleSelector<T extends FieldValues>({
  control,
  name,
  disabled = false,
}: FormRoleSelectorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const role = value as Role | null;
        const isDoctor = role === "doctor";
        const isMother = role === "mother";

        return (
          <View>
            <View className="flex-row gap-3">
              <Pressable
                className={`flex-1 p-4 rounded-xl border-2 ${
                  isDoctor
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
                onPress={() => onChange("doctor")}
                disabled={disabled}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Stethoscope
                    size={24}
                    color={isDoctor ? "#2563eb" : "#9ca3af"}
                  />
                  {isDoctor && <Check size={20} color="#2563eb" />}
                </View>
                <Text
                  className={`font-semibold ${
                    isDoctor
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Healthcare Provider
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    isDoctor
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Manage patients
                </Text>
              </Pressable>

              <Pressable
                className={`flex-1 p-4 rounded-xl border-2 ${
                  isMother
                    ? "bg-pink-50 dark:bg-pink-900/30 border-pink-400"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
                onPress={() => onChange("mother")}
                disabled={disabled}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Heart size={24} color={isMother ? "#db2777" : "#9ca3af"} />
                  {isMother && <Check size={20} color="#db2777" />}
                </View>
                <Text
                  className={`font-semibold ${
                    isMother
                      ? "text-pink-700 dark:text-pink-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Patient
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    isMother
                      ? "text-pink-600 dark:text-pink-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Track pregnancy
                </Text>
              </Pressable>
            </View>

            {error?.message && (
              <Text className="text-xs text-red-500 dark:text-red-400 mt-2">
                {error.message}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
