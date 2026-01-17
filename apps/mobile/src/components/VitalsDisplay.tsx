import { View, Text } from "react-native";
import { Vitals } from "../types";

interface VitalsDisplayProps {
  vitals: Vitals;
  /**
   * Show a top border (for use inside cards where vitals aren't the first element)
   */
  showBorder?: boolean;
}

interface VitalItemProps {
  label: string;
  value: string | number;
  unit?: string;
}

function VitalItem({ label, value, unit }: VitalItemProps) {
  return (
    <View className="mr-4 mb-2">
      <Text className="text-gray-400 text-xs">{label}</Text>
      <Text className="text-gray-700 dark:text-gray-200 font-medium">
        {value}
        {unit && ` ${unit}`}
      </Text>
    </View>
  );
}

export function VitalsDisplay({ vitals, showBorder = true }: VitalsDisplayProps) {
  // Check if there are any vitals to display
  const hasVitals =
    vitals.bloodPressure ||
    vitals.weight ||
    vitals.temperature ||
    vitals.heartRate ||
    vitals.fetalHeartRate ||
    vitals.fundalHeight ||
    vitals.aog;

  if (!hasVitals) {
    return null;
  }

  const borderClasses = showBorder ? "pt-3 border-t border-gray-100 dark:border-gray-700" : "";

  return (
    <View className={`flex-row flex-wrap ${borderClasses}`}>
      {vitals.bloodPressure && (
        <VitalItem label="BP" value={vitals.bloodPressure} />
      )}
      {vitals.weight && (
        <VitalItem label="Weight" value={vitals.weight} unit="kg" />
      )}
      {vitals.temperature && (
        <VitalItem label="Temp" value={vitals.temperature} unit="°C" />
      )}
      {vitals.heartRate && (
        <VitalItem label="HR" value={vitals.heartRate} unit="bpm" />
      )}
      {vitals.fetalHeartRate && (
        <VitalItem label="FHR" value={vitals.fetalHeartRate} unit="bpm" />
      )}
      {vitals.fundalHeight && (
        <VitalItem label="Fundal Height" value={vitals.fundalHeight} unit="cm" />
      )}
      {vitals.aog && <VitalItem label="AOG" value={vitals.aog} />}
    </View>
  );
}
