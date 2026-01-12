import { View, Text } from "react-native";
import { formatDate } from "@/utils";
import type { LabRequest } from "@/types";

interface LabsTabContentProps {
  labs: LabRequest[];
}

export function LabsTabContent({ labs }: LabsTabContentProps) {
  const pendingLabs = labs.filter((l) => l.status === "pending");
  const completedLabs = labs.filter((l) => l.status === "completed");
  const cancelledLabs = labs.filter((l) => l.status === "cancelled");

  if (labs.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-slate-600 text-sm">No lab requests yet</Text>
        <Text className="text-slate-700 text-xs mt-1">
          Add lab requests when creating an entry
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Pending Labs */}
      {pendingLabs.length > 0 && (
        <View className="mb-6">
          <Text className="text-amber-400 font-semibold mb-3">
            Pending ({pendingLabs.length})
          </Text>
          {pendingLabs.map((lab) => (
            <View
              key={lab.id}
              className="bg-slate-800 rounded-xl p-4 mb-3 border border-amber-500/30"
            >
              <Text className="text-white font-semibold">{lab.description}</Text>
              <Text className="text-slate-400 text-xs mt-1">
                Requested: {formatDate(lab.requestedDate)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Completed Labs */}
      {completedLabs.length > 0 && (
        <View className="mb-6">
          <Text className="text-green-400 font-semibold mb-3">
            Completed ({completedLabs.length})
          </Text>
          {completedLabs.map((lab) => (
            <View
              key={lab.id}
              className="bg-slate-800 rounded-xl p-4 mb-3 border border-green-500/30"
            >
              <Text className="text-white font-semibold">{lab.description}</Text>
              {lab.results && (
                <Text className="text-slate-300 text-sm mt-2">
                  {lab.results}
                </Text>
              )}
              <Text className="text-slate-400 text-xs mt-1">
                Completed: {formatDate(lab.completedDate || lab.requestedDate)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Cancelled Labs */}
      {cancelledLabs.length > 0 && (
        <View>
          <Text className="text-slate-500 font-semibold mb-3">
            Cancelled ({cancelledLabs.length})
          </Text>
          {cancelledLabs.map((lab) => (
            <View
              key={lab.id}
              className="bg-slate-800/50 rounded-xl p-4 mb-3 border border-slate-700/50 opacity-60"
            >
              <Text className="text-white font-semibold">{lab.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
