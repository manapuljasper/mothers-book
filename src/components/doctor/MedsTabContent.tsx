import { View, Text, TouchableOpacity } from "react-native";
import { formatDate } from "@/utils";
import type { Medication } from "@/types";

interface MedsTabContentProps {
  medications: Medication[];
  activeMeds: Medication[];
  onEditMedication: (med: Medication) => void;
  onStopMedication: (med: Medication) => void;
}

export function MedsTabContent({
  medications,
  activeMeds,
  onEditMedication,
  onStopMedication,
}: MedsTabContentProps) {
  const inactiveMeds = medications.filter((m) => !m.isActive);

  if (medications.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-slate-600 text-sm">No medications yet</Text>
        <Text className="text-slate-700 text-xs mt-1">
          Add medications when creating an entry
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Active Medications */}
      {activeMeds.length > 0 && (
        <View className="mb-6">
          <Text className="text-white font-semibold mb-3">
            Active ({activeMeds.length})
          </Text>
          {activeMeds.map((med) => (
            <View
              key={med.id}
              className="bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-white font-semibold">{med.name}</Text>
                  <Text className="text-slate-400 text-sm">{med.dosage}</Text>
                  {med.instructions && (
                    <Text className="text-slate-500 text-xs mt-1">
                      {med.instructions}
                    </Text>
                  )}
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => onEditMedication(med)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700"
                    activeOpacity={0.7}
                  >
                    <Text className="text-blue-400 text-xs font-medium">
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onStopMedication(med)}
                    className="px-3 py-1.5 rounded-lg bg-red-900/30"
                    activeOpacity={0.7}
                  >
                    <Text className="text-red-400 text-xs font-medium">
                      Stop
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Inactive Medications */}
      {inactiveMeds.length > 0 && (
        <View>
          <Text className="text-slate-500 font-semibold mb-3">
            Past ({inactiveMeds.length})
          </Text>
          {inactiveMeds.map((med) => (
            <View
              key={med.id}
              className="bg-slate-800/50 rounded-xl p-4 mb-3 border border-slate-700/50 opacity-60"
            >
              <Text className="text-white font-semibold">{med.name}</Text>
              <Text className="text-slate-400 text-sm">{med.dosage}</Text>
              {med.endDate && (
                <Text className="text-slate-500 text-xs mt-1">
                  Ended: {formatDate(med.endDate)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
