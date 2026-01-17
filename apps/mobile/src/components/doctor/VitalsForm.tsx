import { useRef } from "react";
import { View, Text, TextInput } from "react-native";
import type { TextInput as RNTextInput } from "react-native";

export interface VitalsFormData {
  bpSystolic: string;
  bpDiastolic: string;
  weight: string;
  fetalHeartRate: string;
  fundalHeight: string;
  aog: string;
}

interface VitalsFormProps {
  values: VitalsFormData;
  onChange: (values: VitalsFormData) => void;
}

export function VitalsForm({ values, onChange }: VitalsFormProps) {
  const bpDiastolicRef = useRef<RNTextInput>(null);

  const updateField = (field: keyof VitalsFormData, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <>
      <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2 mt-2">
        Vitals
      </Text>
      <View className="flex-row flex-wrap">
        {/* Blood Pressure */}
        <View className="w-1/2 pr-2 mb-3">
          <Text className="text-gray-400 text-xs mb-1">Blood Pressure</Text>
          <View className="flex-row items-center">
            <TextInput
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex-1 text-gray-900 dark:text-white"
              placeholder="120"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              maxLength={3}
              returnKeyType="next"
              value={values.bpSystolic}
              onChangeText={(v) => updateField("bpSystolic", v)}
              onSubmitEditing={() => bpDiastolicRef.current?.focus()}
            />
            <Text className="text-gray-400 text-lg mx-2">/</Text>
            <TextInput
              ref={bpDiastolicRef}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex-1 text-gray-900 dark:text-white"
              placeholder="80"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              maxLength={3}
              value={values.bpDiastolic}
              onChangeText={(v) => updateField("bpDiastolic", v)}
            />
          </View>
        </View>

        {/* Weight */}
        <View className="w-1/2 pl-2 mb-3">
          <Text className="text-gray-400 text-xs mb-1">Weight (kg)</Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            placeholder="65"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={values.weight}
            onChangeText={(v) => updateField("weight", v)}
          />
        </View>

        {/* FHR */}
        <View className="w-1/2 pr-2 mb-3">
          <Text className="text-gray-400 text-xs mb-1">FHR (bpm)</Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            placeholder="140"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={values.fetalHeartRate}
            onChangeText={(v) => updateField("fetalHeartRate", v)}
          />
        </View>

        {/* Fundal Height */}
        <View className="w-1/2 pl-2 mb-3">
          <Text className="text-gray-400 text-xs mb-1">Fundal Height (cm)</Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            placeholder="28"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={values.fundalHeight}
            onChangeText={(v) => updateField("fundalHeight", v)}
          />
        </View>

        {/* AOG */}
        <View className="w-full mb-3">
          <Text className="text-gray-400 text-xs mb-1">AOG</Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            placeholder="28 weeks 3 days"
            placeholderTextColor="#9ca3af"
            value={values.aog}
            onChangeText={(v) => updateField("aog", v)}
          />
        </View>
      </View>
    </>
  );
}
