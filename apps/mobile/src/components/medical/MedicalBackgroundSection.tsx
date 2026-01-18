/**
 * Medical Background Section
 *
 * Displays allergies and medical history in a visually distinct,
 * safety-focused design. Allergies are highlighted with warm amber
 * warning colors to ensure visibility without being alarming.
 */

import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import {
  AlertTriangle,
  Heart,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Stethoscope,
  ShieldAlert,
} from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import { AnimatedCollapsible } from "@/components/ui";
import type { MedicalHistoryItem } from "@/types";

interface MedicalBackgroundSectionProps {
  allergies?: string[];
  medicalHistory?: MedicalHistoryItem[];
  /** When true, shows edit controls */
  editable?: boolean;
  /** Callback when allergies are updated */
  onAllergiesChange?: (allergies: string[]) => void;
  /** Callback when medical history is updated */
  onMedicalHistoryChange?: (history: MedicalHistoryItem[]) => void;
  /** Callback to open add allergy modal */
  onAddAllergy?: () => void;
  /** Callback to open add medical history modal */
  onAddMedicalHistory?: () => void;
  /** Compact mode for inline display (e.g., in entry form) */
  compact?: boolean;
}

export function MedicalBackgroundSection({
  allergies = [],
  medicalHistory = [],
  editable = false,
  onAllergiesChange,
  onMedicalHistoryChange,
  onAddAllergy,
  onAddMedicalHistory,
  compact = false,
}: MedicalBackgroundSectionProps) {
  const [expanded, setExpanded] = useState(!compact);

  const hasAllergies = allergies.length > 0;
  const hasHistory = medicalHistory.length > 0;
  const isEmpty = !hasAllergies && !hasHistory;

  if (isEmpty && !editable) {
    return null;
  }

  // Special empty state when editable - show clear add buttons
  if (isEmpty && editable) {
    return (
      <View>
        {/* Section Header */}
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
            <ShieldAlert size={14} color="#f59e0b" strokeWidth={2} />
          </View>
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            Medical Background
          </Text>
        </View>

        {/* Add Buttons Row */}
        <View className="flex-row gap-3">
          {onAddAllergy && (
            <Pressable
              onPress={onAddAllergy}
              className="flex-1 flex-row items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-dashed border-amber-300 dark:border-amber-700 rounded-xl py-3 px-4"
            >
              <AlertTriangle size={16} color="#f59e0b" strokeWidth={2} />
              <Text className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                Add Allergy
              </Text>
            </Pressable>
          )}
          {onAddMedicalHistory && (
            <Pressable
              onPress={onAddMedicalHistory}
              className="flex-1 flex-row items-center justify-center gap-2 bg-pink-50 dark:bg-pink-900/20 border border-dashed border-pink-300 dark:border-pink-700 rounded-xl py-3 px-4"
            >
              <Heart size={16} color="#ec4899" strokeWidth={2} />
              <Text className="text-pink-700 dark:text-pink-400 text-sm font-medium">
                Add Condition
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      {/* Section Header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between py-2"
      >
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
            <ShieldAlert size={14} color="#f59e0b" strokeWidth={2} />
          </View>
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            Medical Background
          </Text>
          {hasAllergies && (
            <View className="bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {allergies.length} {allergies.length === 1 ? "Allergy" : "Allergies"}
              </Text>
            </View>
          )}
        </View>
        {compact && (
          expanded ? (
            <ChevronUp size={18} color="#64748b" strokeWidth={2} />
          ) : (
            <ChevronDown size={18} color="#64748b" strokeWidth={2} />
          )
        )}
      </Pressable>

      <AnimatedCollapsible expanded={expanded}>
        <View className="mt-2 space-y-3">
          {/* Allergies Section */}
          <AllergiesCard
            allergies={allergies}
            editable={editable}
            onAllergiesChange={onAllergiesChange}
            onAddAllergy={onAddAllergy}
          />

          {/* Medical History Section */}
          <MedicalHistoryCard
            history={medicalHistory}
            editable={editable}
            onHistoryChange={onMedicalHistoryChange}
            onAddMedicalHistory={onAddMedicalHistory}
          />
        </View>
      </AnimatedCollapsible>
    </View>
  );
}

// ============ Allergies Card ============

interface AllergiesCardProps {
  allergies: string[];
  editable?: boolean;
  onAllergiesChange?: (allergies: string[]) => void;
  onAddAllergy?: () => void;
}

function AllergiesCard({
  allergies,
  editable = false,
  onAllergiesChange,
  onAddAllergy,
}: AllergiesCardProps) {
  const hasAllergies = allergies.length > 0;

  const handleRemoveAllergy = (index: number) => {
    if (!onAllergiesChange) return;
    const updated = allergies.filter((_, i) => i !== index);
    onAllergiesChange(updated);
  };

  return (
    <View
      className={`rounded-xl p-4 border ${
        hasAllergies
          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-amber-200 dark:border-amber-800/50"
          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
      }`}
    >
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-3">
        <AlertTriangle
          size={16}
          color={hasAllergies ? "#f59e0b" : "#94a3b8"}
          strokeWidth={2}
        />
        <Text
          className={`text-sm font-semibold ${
            hasAllergies
              ? "text-amber-800 dark:text-amber-300"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Known Allergies
        </Text>
      </View>

      {/* Allergies List */}
      {hasAllergies ? (
        <View className="flex-row flex-wrap gap-2">
          {allergies.map((allergy, index) => (
            <Animated.View
              key={`${allergy}-${index}`}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              layout={Layout.springify()}
            >
              <View className="flex-row items-center bg-amber-100 dark:bg-amber-900/50 rounded-full px-3 py-1.5 border border-amber-300 dark:border-amber-700">
                <Text className="text-amber-900 dark:text-amber-200 text-sm font-medium">
                  {allergy}
                </Text>
                {editable && (
                  <Pressable
                    onPress={() => handleRemoveAllergy(index)}
                    className="ml-2 -mr-1"
                    hitSlop={8}
                  >
                    <X size={14} color="#92400e" strokeWidth={2.5} />
                  </Pressable>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <Text className="text-slate-400 dark:text-slate-500 text-sm italic">
          No known allergies recorded
        </Text>
      )}

      {/* Add Button (when editable) */}
      {editable && onAddAllergy && (
        <Pressable
          onPress={onAddAllergy}
          className="flex-row items-center gap-1.5 mt-3 self-start"
        >
          <Plus size={14} color="#f59e0b" strokeWidth={2} />
          <Text className="text-amber-600 dark:text-amber-400 text-sm font-medium">
            Add allergy
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ============ Medical History Card ============

interface MedicalHistoryCardProps {
  history: MedicalHistoryItem[];
  editable?: boolean;
  onHistoryChange?: (history: MedicalHistoryItem[]) => void;
  onAddMedicalHistory?: () => void;
}

function MedicalHistoryCard({
  history,
  editable = false,
  onHistoryChange,
  onAddMedicalHistory,
}: MedicalHistoryCardProps) {
  const hasHistory = history.length > 0;

  const handleRemoveCondition = (index: number) => {
    if (!onHistoryChange) return;
    const updated = history.filter((_, i) => i !== index);
    onHistoryChange(updated);
  };

  return (
    <View className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mt-3">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-3">
        <Heart size={16} color="#ec4899" strokeWidth={2} />
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Medical History
        </Text>
      </View>

      {/* History List */}
      {hasHistory ? (
        <View className="space-y-2">
          {history.map((item, index) => (
            <Animated.View
              key={`${item.condition}-${index}`}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              layout={Layout.springify()}
              className="flex-row items-start bg-white dark:bg-slate-700/50 rounded-lg p-3 border border-slate-100 dark:border-slate-600"
            >
              <Stethoscope
                size={14}
                color="#64748b"
                strokeWidth={2}
                style={{ marginTop: 2 }}
              />
              <View className="flex-1 ml-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-800 dark:text-slate-200 font-medium">
                    {item.condition}
                  </Text>
                  {item.diagnosedYear && (
                    <Text className="text-slate-400 dark:text-slate-500 text-xs">
                      Since {item.diagnosedYear}
                    </Text>
                  )}
                </View>
                {item.notes && (
                  <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                    {item.notes}
                  </Text>
                )}
              </View>
              {editable && (
                <Pressable
                  onPress={() => handleRemoveCondition(index)}
                  className="ml-2"
                  hitSlop={8}
                >
                  <X size={14} color="#94a3b8" strokeWidth={2} />
                </Pressable>
              )}
            </Animated.View>
          ))}
        </View>
      ) : (
        <Text className="text-slate-400 dark:text-slate-500 text-sm italic">
          No medical history recorded
        </Text>
      )}

      {/* Add Button (when editable) */}
      {editable && onAddMedicalHistory && (
        <Pressable
          onPress={onAddMedicalHistory}
          className="flex-row items-center gap-1.5 mt-3 self-start"
        >
          <Plus size={14} color="#ec4899" strokeWidth={2} />
          <Text className="text-pink-600 dark:text-pink-400 text-sm font-medium">
            Add condition
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ============ Allergy Warning Banner ============
// Compact banner for display at top of entry forms

interface AllergyWarningBannerProps {
  allergies: string[];
  /** When true, shows full list. When false, shows count only */
  expanded?: boolean;
  onPress?: () => void;
}

export function AllergyWarningBanner({
  allergies,
  expanded = false,
  onPress,
}: AllergyWarningBannerProps) {
  if (allergies.length === 0) return null;

  return (
    <Pressable
      onPress={onPress}
      className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-xl p-3 mb-4 shadow-sm"
      style={{
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
          <AlertTriangle size={18} color="#ffffff" strokeWidth={2.5} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-sm">
            Allergy Alert
          </Text>
          {expanded ? (
            <Text className="text-amber-100 text-sm mt-0.5">
              {allergies.join(", ")}
            </Text>
          ) : (
            <Text className="text-amber-100 text-sm">
              {allergies.length} known {allergies.length === 1 ? "allergy" : "allergies"} — tap to view
            </Text>
          )}
        </View>
        {!expanded && (
          <ChevronDown size={18} color="#fef3c7" strokeWidth={2} />
        )}
      </View>
    </Pressable>
  );
}
