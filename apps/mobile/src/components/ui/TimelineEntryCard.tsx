import { View, Text } from "react-native";
import {
  ChevronRight,
  FileText,
  Pill,
  Activity,
  Scale,
  Calendar,
} from "lucide-react-native";
import { CardPressable } from "./AnimatedPressable";
import type { Vitals, EntryType } from "@/types";
import { ENTRY_TYPE_LABELS } from "@/types";
import { formatDate, formatTime } from "@/utils";

interface TimelineEntryCardProps {
  entryType: EntryType;
  doctorName: string;
  visitDate: Date | string;
  vitals?: Vitals;
  followUpDate?: Date | string;
  hasNotes?: boolean;
  hasMedications?: boolean;
  /** Clinic name for the visit */
  clinicName?: string;
  /** Doctor's notes text (for preview) */
  notes?: string;
  /** Recommendations/plan text (for preview in expanded mode) */
  recommendations?: string;
  /** Expanded shows vitals in grid format, compact shows inline icons */
  variant?: "expanded" | "compact";
  /** Lower opacity for older entries */
  faded?: boolean;
  onPress?: () => void;
}

interface VitalsGridItemProps {
  label: string;
  value: string;
  unit?: string;
}

function VitalsGridItem({ label, value, unit }: VitalsGridItemProps) {
  return (
    <View className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-2 items-center border border-gray-100 dark:border-slate-700/50">
      <Text className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider mb-0.5">
        {label}
      </Text>
      <Text className="font-bold text-gray-800 dark:text-white text-sm">
        {value}
        {unit && (
          <Text className="text-[10px] font-normal text-gray-500"> {unit}</Text>
        )}
      </Text>
    </View>
  );
}

export function TimelineEntryCard({
  entryType,
  doctorName,
  visitDate,
  vitals,
  followUpDate,
  hasNotes = false,
  hasMedications = false,
  clinicName,
  notes,
  recommendations,
  variant = "compact",
  faded = false,
  onPress,
}: TimelineEntryCardProps) {
  const dateObj = typeof visitDate === "string" ? new Date(visitDate) : visitDate;
  const timeStr = formatTime(dateObj);

  const hasVitals = vitals && (vitals.bloodPressure || vitals.weight || vitals.aog);

  // Truncate notes for preview (first ~60 chars)
  const notesPreview = notes && notes.trim()
    ? notes.trim().length > 60
      ? notes.trim().substring(0, 60).trim() + "..."
      : notes.trim()
    : null;

  // Truncate recommendations for preview (first ~80 chars)
  const planPreview = recommendations && recommendations.trim()
    ? recommendations.trim().length > 80
      ? recommendations.trim().substring(0, 80).trim() + "..."
      : recommendations.trim()
    : null;

  return (
    <CardPressable
      onPress={onPress}
      className={`flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 ${
        faded ? "opacity-80" : ""
      }`}
    >
      {/* Header Row */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-bold text-gray-900 dark:text-white text-base">
            {ENTRY_TYPE_LABELS[entryType]}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-slate-400 font-medium">
            {doctorName} • {timeStr}
          </Text>
          {clinicName && (
            <Text className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
              {clinicName}
            </Text>
          )}
        </View>
        <ChevronRight size={20} color="#9ca3af" strokeWidth={1.5} />
      </View>

      {/* Vitals Display */}
      {hasVitals && variant === "expanded" && (
        <View className="flex-row gap-2 mb-3">
          {vitals.bloodPressure && (
            <View className="flex-1">
              <VitalsGridItem label="BP" value={vitals.bloodPressure} />
            </View>
          )}
          {vitals.weight && (
            <View className="flex-1">
              <VitalsGridItem
                label="Weight"
                value={vitals.weight.toString()}
                unit="kg"
              />
            </View>
          )}
          {vitals.aog && (
            <View className="flex-1">
              <VitalsGridItem label="AOG" value={vitals.aog} />
            </View>
          )}
        </View>
      )}

      {/* Compact Vitals Display */}
      {hasVitals && variant === "compact" && (
        <View className="flex-row items-center gap-4 text-sm">
          {vitals.bloodPressure && (
            <View className="flex-row items-center gap-1.5">
              <Activity size={14} color="#9ca3af" strokeWidth={1.5} />
              <Text className="font-semibold text-gray-600 dark:text-slate-300">
                {vitals.bloodPressure}
              </Text>
            </View>
          )}
          {vitals.weight && (
            <View className="flex-row items-center gap-1.5">
              <Scale size={14} color="#9ca3af" strokeWidth={1.5} />
              <Text className="font-semibold text-gray-600 dark:text-slate-300">
                {vitals.weight}kg
              </Text>
            </View>
          )}
          {vitals.aog && (
            <View className="flex-row items-center gap-1.5">
              <Calendar size={14} color="#9ca3af" strokeWidth={1.5} />
              <Text className="font-semibold text-gray-600 dark:text-slate-300">
                {vitals.aog}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Notes Preview */}
      {notesPreview && (
        <View className="mt-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
          <Text className="text-xs text-gray-600 dark:text-slate-300" numberOfLines={2}>
            {notesPreview}
          </Text>
        </View>
      )}

      {/* Plan Preview (expanded mode only) */}
      {planPreview && variant === "expanded" && (
        <View className="mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-100 dark:border-amber-800/30">
          <Text className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">
            Plan
          </Text>
          <Text className="text-xs text-amber-700 dark:text-amber-300" numberOfLines={2}>
            {planPreview}
          </Text>
        </View>
      )}

      {/* Footer Row - Follow-up and Icons */}
      {(followUpDate || hasNotes || hasMedications) && (
        <View className="flex-row items-center gap-2 mt-2">
          {followUpDate && (
            <View className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800/50">
              <Text className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                Follow-up: {formatDate(followUpDate, "short")}
              </Text>
            </View>
          )}
          <View className="flex-1" />
          {hasNotes && (
            <FileText size={14} color="#9ca3af" strokeWidth={1.5} />
          )}
          {hasMedications && (
            <Pill size={14} color="#9ca3af" strokeWidth={1.5} />
          )}
        </View>
      )}
    </CardPressable>
  );
}
