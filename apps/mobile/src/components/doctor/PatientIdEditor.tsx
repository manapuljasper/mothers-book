/**
 * Patient ID Editor Component
 *
 * Inline editor for the doctor's internal patient ID.
 * Shows as a badge with edit button, expands to input on edit.
 */

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Hash, Pencil, Check, X } from "lucide-react-native";

interface PatientIdEditorProps {
  patientId?: string;
  onSave: (patientId: string | undefined) => Promise<void>;
  compact?: boolean;
}

export function PatientIdEditor({
  patientId,
  onSave,
  compact = false,
}: PatientIdEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(patientId || "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(patientId || "");
      // Focus input after render
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isEditing, patientId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue.trim() || undefined);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(patientId || "");
    setIsEditing(false);
  };

  // Editing mode
  if (isEditing) {
    return (
      <View className={`flex-row items-center gap-1.5 ${compact ? "bg-slate-800/80 rounded-lg px-2 py-1" : "bg-slate-800/50 rounded-lg p-2"}`}>
        <Hash size={12} color="#60a5fa" strokeWidth={2} />
        <TextInput
          ref={inputRef}
          value={editValue}
          onChangeText={setEditValue}
          placeholder="ID"
          placeholderTextColor="#64748b"
          className="text-white text-sm py-0.5 px-2 bg-slate-700 rounded min-w-[60px] max-w-[100px]"
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isSaving}
        />
        {isSaving ? (
          <ActivityIndicator size="small" color="#60a5fa" />
        ) : (
          <>
            <Pressable
              onPress={handleSave}
              className="p-1 bg-emerald-500/20 rounded-full"
              hitSlop={8}
            >
              <Check size={14} color="#10b981" strokeWidth={2.5} />
            </Pressable>
            <Pressable
              onPress={handleCancel}
              className="p-1 bg-slate-700 rounded-full"
              hitSlop={8}
            >
              <X size={14} color="#94a3b8" strokeWidth={2} />
            </Pressable>
          </>
        )}
      </View>
    );
  }

  // Display mode
  if (patientId) {
    return (
      <Pressable
        onPress={() => setIsEditing(true)}
        className={`flex-row items-center gap-1.5 ${
          compact
            ? "bg-white/15 px-2 py-0.5 rounded"
            : "bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg"
        }`}
      >
        <Hash size={11} color={compact ? "#bfdbfe" : "#60a5fa"} strokeWidth={2.5} />
        <Text className={compact ? "text-blue-100 text-xs font-medium" : "text-blue-400 text-sm font-semibold"}>
          {patientId}
        </Text>
      </Pressable>
    );
  }

  // No ID set - show add button
  return (
    <Pressable
      onPress={() => setIsEditing(true)}
      className={`flex-row items-center gap-1 ${
        compact
          ? "bg-white/10 px-2 py-0.5 rounded"
          : "bg-slate-800/30 border border-dashed border-slate-600 px-3 py-1.5 rounded-lg"
      }`}
    >
      <Hash size={11} color={compact ? "#93c5fd" : "#64748b"} strokeWidth={2} />
      <Text className={compact ? "text-blue-200/70 text-xs" : "text-slate-500 text-sm"}>
        Add ID
      </Text>
    </Pressable>
  );
}
