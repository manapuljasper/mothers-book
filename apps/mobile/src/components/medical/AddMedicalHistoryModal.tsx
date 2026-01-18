/**
 * Add Medical History Modal
 *
 * Modal for adding multiple medical conditions at once.
 * Supports both clicking suggestions and manual text entry.
 */

import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { X, Heart, Plus, ChevronDown, ChevronUp } from "lucide-react-native";
import type { MedicalHistoryItem } from "@/types";

const COMMON_CONDITIONS = [
  "Hypertension",
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Gestational Diabetes",
  "Asthma",
  "Thyroid disorder",
  "Hyperthyroidism",
  "Hypothyroidism",
  "Heart disease",
  "Epilepsy",
  "Anemia",
  "Previous C-section",
  "Preeclampsia",
  "Ectopic pregnancy",
  "Miscarriage",
  "PCOS",
  "Endometriosis",
  "Depression",
  "Anxiety",
  "Kidney disease",
  "Liver disease",
  "HIV/AIDS",
  "Hepatitis B",
  "Hepatitis C",
  "Tuberculosis",
  "Cancer",
  "Autoimmune disorder",
];

interface SelectedCondition {
  condition: string;
  notes?: string;
  diagnosedYear?: number;
  showDetails: boolean;
}

interface AddMedicalHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: MedicalHistoryItem) => void;
  existingConditions?: MedicalHistoryItem[];
}

export function AddMedicalHistoryModal({
  visible,
  onClose,
  onAdd,
  existingConditions = [],
}: AddMedicalHistoryModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<SelectedCondition[]>([]);
  const inputRef = useRef<TextInput>(null);
  const currentYear = new Date().getFullYear();

  // Filter out already existing and already selected conditions
  const availableSuggestions = COMMON_CONDITIONS.filter(
    (c) =>
      !existingConditions.some((e) => e.condition.toLowerCase() === c.toLowerCase()) &&
      !selectedConditions.some((s) => s.condition.toLowerCase() === c.toLowerCase())
  );

  const handleAddFromInput = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (
      existingConditions.some((c) => c.condition.toLowerCase() === trimmed.toLowerCase()) ||
      selectedConditions.some((s) => s.condition.toLowerCase() === trimmed.toLowerCase())
    ) {
      return;
    }

    setSelectedConditions([
      ...selectedConditions,
      { condition: trimmed, showDetails: false },
    ]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (selectedConditions.some((s) => s.condition.toLowerCase() === suggestion.toLowerCase())) {
      return;
    }
    setSelectedConditions([
      ...selectedConditions,
      { condition: suggestion, showDetails: false },
    ]);
  };

  const handleRemoveSelected = (condition: string) => {
    setSelectedConditions(selectedConditions.filter((s) => s.condition !== condition));
  };

  const handleToggleDetails = (condition: string) => {
    setSelectedConditions(
      selectedConditions.map((s) =>
        s.condition === condition ? { ...s, showDetails: !s.showDetails } : s
      )
    );
  };

  const handleUpdateCondition = (
    condition: string,
    field: "notes" | "diagnosedYear",
    value: string
  ) => {
    setSelectedConditions(
      selectedConditions.map((s) => {
        if (s.condition !== condition) return s;
        if (field === "diagnosedYear") {
          const cleaned = value.replace(/[^0-9]/g, "").slice(0, 4);
          const yearNum = cleaned ? parseInt(cleaned, 10) : undefined;
          return { ...s, diagnosedYear: yearNum };
        }
        return { ...s, [field]: value || undefined };
      })
    );
  };

  const handleSave = () => {
    // Add any remaining input text
    const trimmed = inputValue.trim();
    let finalConditions = [...selectedConditions];

    if (
      trimmed &&
      !existingConditions.some((c) => c.condition.toLowerCase() === trimmed.toLowerCase()) &&
      !finalConditions.some((s) => s.condition.toLowerCase() === trimmed.toLowerCase())
    ) {
      finalConditions.push({ condition: trimmed, showDetails: false });
    }

    // Add all selected conditions
    finalConditions.forEach((item) => {
      onAdd({
        condition: item.condition,
        notes: item.notes,
        diagnosedYear: item.diagnosedYear,
      });
    });

    handleClose();
  };

  const handleClose = () => {
    setInputValue("");
    setSelectedConditions([]);
    onClose();
  };

  const hasConditions = selectedConditions.length > 0 || inputValue.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-slate-900"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-700">
          <Pressable onPress={handleClose} className="p-1">
            <X size={24} color="#94a3b8" strokeWidth={2} />
          </Pressable>
          <Text className="text-lg font-bold text-white">Add Conditions</Text>
          <Pressable
            onPress={handleSave}
            disabled={!hasConditions}
            className={`px-4 py-2 rounded-full ${
              hasConditions ? "bg-pink-500" : "bg-slate-700"
            }`}
          >
            <Text className={`font-semibold ${hasConditions ? "text-white" : "text-slate-500"}`}>
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-5 pt-6 pb-8">
            {/* Info Banner */}
            <View className="flex-row items-center bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 mb-6">
              <Heart size={20} color="#ec4899" strokeWidth={2} />
              <Text className="flex-1 ml-3 text-pink-200 text-sm">
                Record past medical conditions. Tap a condition to add optional details.
              </Text>
            </View>

            {/* Selected Conditions */}
            {selectedConditions.length > 0 && (
              <View className="mb-4">
                <Text className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">
                  Selected ({selectedConditions.length})
                </Text>
                <View className="gap-2">
                  {selectedConditions.map((item) => (
                    <View
                      key={item.condition}
                      className="bg-pink-500/10 border border-pink-500/20 rounded-xl overflow-hidden"
                    >
                      <View className="flex-row items-center px-3 py-2">
                        <Pressable
                          onPress={() => handleToggleDetails(item.condition)}
                          className="flex-1 flex-row items-center"
                        >
                          <Text className="text-pink-200 text-sm font-medium flex-1">
                            {item.condition}
                          </Text>
                          {item.showDetails ? (
                            <ChevronUp size={16} color="#f472b6" strokeWidth={2} />
                          ) : (
                            <ChevronDown size={16} color="#f472b6" strokeWidth={2} />
                          )}
                        </Pressable>
                        <Pressable
                          onPress={() => handleRemoveSelected(item.condition)}
                          hitSlop={8}
                          className="ml-3 p-1"
                        >
                          <X size={16} color="#f472b6" strokeWidth={2.5} />
                        </Pressable>
                      </View>

                      {item.showDetails && (
                        <View className="px-3 pb-3 pt-1 border-t border-pink-500/20">
                          <View className="flex-row gap-2 mb-2">
                            <TextInput
                              value={item.diagnosedYear?.toString() || ""}
                              onChangeText={(v) =>
                                handleUpdateCondition(item.condition, "diagnosedYear", v)
                              }
                              placeholder="Year"
                              placeholderTextColor="#64748b"
                              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-20"
                              keyboardType="number-pad"
                              maxLength={4}
                            />
                            <TextInput
                              value={item.notes || ""}
                              onChangeText={(v) =>
                                handleUpdateCondition(item.condition, "notes", v)
                              }
                              placeholder="Notes (optional)"
                              placeholderTextColor="#64748b"
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Input with Add button */}
            <Text className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">
              Type to add custom
            </Text>
            <View className="flex-row items-center gap-2 mb-6">
              <TextInput
                ref={inputRef}
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleAddFromInput}
                placeholder="Type condition name..."
                placeholderTextColor="#64748b"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-base"
                autoCapitalize="words"
                returnKeyType="done"
              />
              <Pressable
                onPress={handleAddFromInput}
                disabled={!inputValue.trim()}
                className={`p-3 rounded-xl ${
                  inputValue.trim() ? "bg-pink-500" : "bg-slate-800 border border-slate-700"
                }`}
              >
                <Plus
                  size={20}
                  color={inputValue.trim() ? "#ffffff" : "#64748b"}
                  strokeWidth={2}
                />
              </Pressable>
            </View>

            {/* Common conditions suggestions */}
            {availableSuggestions.length > 0 && (
              <>
                <Text className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wide">
                  Quick add
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {availableSuggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      onPress={() => handleSelectSuggestion(suggestion)}
                      className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-full active:bg-slate-700"
                    >
                      <Text className="text-slate-300 text-sm">{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
