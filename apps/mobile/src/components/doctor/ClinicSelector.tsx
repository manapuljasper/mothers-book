/**
 * Clinic Selector Component
 *
 * Horizontal scrollable pills for selecting a clinic when creating entries.
 * Auto-selects primary clinic. Shows non-interactive display if only one clinic.
 */

import { View, Text, ScrollView, Pressable } from "react-native";
import { Building2, Check } from "lucide-react-native";
import { Id } from "@convex/_generated/dataModel";

interface ClinicOption {
  id: Id<"doctorClinics">;
  name: string;
  isPrimary?: boolean;
}

interface ClinicSelectorProps {
  clinics: ClinicOption[];
  selectedClinicId: Id<"doctorClinics"> | null;
  onSelectClinic: (clinicId: Id<"doctorClinics">) => void;
}

export function ClinicSelector({
  clinics,
  selectedClinicId,
  onSelectClinic,
}: ClinicSelectorProps) {
  // Don't render if no clinics
  if (clinics.length === 0) {
    return null;
  }

  // Single clinic - show non-interactive display
  if (clinics.length === 1) {
    return (
      <View className="flex-row items-center px-4 py-2.5 bg-slate-800/50 border-b border-slate-700/50">
        <Building2 size={14} color="#60a5fa" strokeWidth={2} />
        <Text className="ml-2 text-sm font-medium text-slate-300">
          {clinics[0].name}
        </Text>
      </View>
    );
  }

  // Multiple clinics - show scrollable selector
  return (
    <View className="bg-slate-800/50 border-b border-slate-700/50">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 py-2.5 gap-2"
      >
        {clinics.map((clinic) => {
          const isSelected = selectedClinicId === clinic.id;
          return (
            <Pressable
              key={clinic.id}
              onPress={() => onSelectClinic(clinic.id)}
              className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                isSelected
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-slate-700/50 border-slate-600"
              }`}
            >
              {isSelected && (
                <Check size={12} color="#3b82f6" strokeWidth={2.5} style={{ marginRight: 4 }} />
              )}
              <Text
                className={`text-sm font-medium ${
                  isSelected ? "text-blue-400" : "text-slate-300"
                }`}
                numberOfLines={1}
              >
                {clinic.name}
              </Text>
              {clinic.isPrimary && !isSelected && (
                <View className="ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
