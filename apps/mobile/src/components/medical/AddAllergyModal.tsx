/**
 * Add Allergy Modal
 *
 * Modal for adding multiple allergies at once with tag-style input.
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
import { X, AlertTriangle, Plus } from "lucide-react-native";

const COMMON_ALLERGIES = [
  "Penicillin",
  "Amoxicillin",
  "Sulfa drugs",
  "NSAIDs",
  "Aspirin",
  "Ibuprofen",
  "Latex",
  "Shellfish",
  "Peanuts",
  "Tree nuts",
  "Eggs",
  "Milk",
  "Soy",
  "Wheat",
  "Fish",
  "Codeine",
  "Morphine",
  "Contrast dye",
  "Local anesthetics",
  "Tetracycline",
];

interface AddAllergyModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (allergy: string) => void;
  existingAllergies?: string[];
}

export function AddAllergyModal({
  visible,
  onClose,
  onAdd,
  existingAllergies = [],
}: AddAllergyModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Filter out already existing and already selected allergies
  const availableSuggestions = COMMON_ALLERGIES.filter(
    (a) =>
      !existingAllergies.some((e) => e.toLowerCase() === a.toLowerCase()) &&
      !selectedAllergies.some((s) => s.toLowerCase() === a.toLowerCase())
  );

  const handleAddFromInput = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Check if already exists
    if (
      existingAllergies.some((a) => a.toLowerCase() === trimmed.toLowerCase()) ||
      selectedAllergies.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    ) {
      return;
    }

    setSelectedAllergies([...selectedAllergies, trimmed]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (selectedAllergies.some((s) => s.toLowerCase() === suggestion.toLowerCase())) {
      return;
    }
    setSelectedAllergies([...selectedAllergies, suggestion]);
  };

  const handleRemoveSelected = (allergy: string) => {
    setSelectedAllergies(selectedAllergies.filter((s) => s !== allergy));
  };

  const handleSave = () => {
    // Add any remaining input text
    const trimmed = inputValue.trim();
    let finalAllergies = [...selectedAllergies];

    if (
      trimmed &&
      !existingAllergies.some((a) => a.toLowerCase() === trimmed.toLowerCase()) &&
      !finalAllergies.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    ) {
      finalAllergies.push(trimmed);
    }

    // Add all selected allergies
    finalAllergies.forEach((allergy) => {
      onAdd(allergy);
    });

    handleClose();
  };

  const handleClose = () => {
    setInputValue("");
    setSelectedAllergies([]);
    onClose();
  };

  const hasAllergies = selectedAllergies.length > 0 || inputValue.trim().length > 0;

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
          <Text className="text-lg font-bold text-white">Add Allergies</Text>
          <Pressable
            onPress={handleSave}
            disabled={!hasAllergies}
            className={`px-4 py-2 rounded-full ${
              hasAllergies ? "bg-amber-500" : "bg-slate-700"
            }`}
          >
            <Text className={`font-semibold ${hasAllergies ? "text-white" : "text-slate-500"}`}>
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-5 pt-6 pb-8">
            {/* Warning Banner */}
            <View className="flex-row items-center bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <AlertTriangle size={20} color="#f59e0b" strokeWidth={2} />
              <Text className="flex-1 ml-3 text-amber-200 text-sm">
                Allergies are critical safety information displayed prominently during visits.
              </Text>
            </View>

            {/* Selected Allergies */}
            {selectedAllergies.length > 0 && (
              <View className="mb-4">
                <Text className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">
                  Selected ({selectedAllergies.length})
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {selectedAllergies.map((allergy) => (
                    <View
                      key={allergy}
                      className="flex-row items-center bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-amber-200 text-sm font-medium">{allergy}</Text>
                      <Pressable
                        onPress={() => handleRemoveSelected(allergy)}
                        hitSlop={8}
                        className="ml-2"
                      >
                        <X size={14} color="#fbbf24" strokeWidth={2.5} />
                      </Pressable>
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
                placeholder="Type allergy name..."
                placeholderTextColor="#64748b"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-base"
                autoCapitalize="words"
                returnKeyType="done"
              />
              <Pressable
                onPress={handleAddFromInput}
                disabled={!inputValue.trim()}
                className={`p-3 rounded-xl ${
                  inputValue.trim() ? "bg-amber-500" : "bg-slate-800 border border-slate-700"
                }`}
              >
                <Plus
                  size={20}
                  color={inputValue.trim() ? "#ffffff" : "#64748b"}
                  strokeWidth={2}
                />
              </Pressable>
            </View>

            {/* Common allergies suggestions */}
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
