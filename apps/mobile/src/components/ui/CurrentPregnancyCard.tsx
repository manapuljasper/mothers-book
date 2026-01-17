import { View, Text } from "react-native";
import { Baby, Calendar, CalendarDays, Stethoscope, ChevronRight, Flower2 } from "lucide-react-native";
import type { MotherBooklet } from "../../types";
import { calculateAOGParts, formatDate } from "../../utils";
import { ButtonPressable } from "./AnimatedPressable";

interface CurrentPregnancyCardProps {
  booklet: MotherBooklet;
  assignedDoctor?: { fullName: string } | null;
  onViewRecords: () => void;
}

export function CurrentPregnancyCard({
  booklet,
  assignedDoctor,
  onViewRecords,
}: CurrentPregnancyCardProps) {
  // Calculate AOG if LMP is available
  const aog = booklet.lastMenstrualPeriod
    ? calculateAOGParts(booklet.lastMenstrualPeriod)
    : null;

  // Format due date
  const dueDate = booklet.expectedDueDate
    ? formatDate(booklet.expectedDueDate)
    : null;
  const dueYear = booklet.expectedDueDate
    ? new Date(booklet.expectedDueDate).getFullYear()
    : null;

  return (
    <View className="bg-white dark:bg-gray-800 mx-5 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
      {/* Decorative flower background */}
      <View className="absolute -right-8 -top-8 opacity-[0.04] dark:opacity-[0.06]">
        <Flower2 size={180} color="#9ca3af" strokeWidth={1} />
      </View>

      {/* Header with icon and title */}
      <View className="flex-row items-start gap-4 mb-6 relative z-10">
        <View className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-900/20 items-center justify-center">
          <Baby size={32} color="#ec4899" strokeWidth={1.5} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {booklet.label}
          </Text>
          <View className="flex-row items-center mt-2 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 self-start">
            <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
            <Text className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
              Active
            </Text>
          </View>
        </View>
      </View>

      {/* AOG and Due Date Cards */}
      <View className="flex-row gap-3 mb-4 relative z-10">
        {/* Current AOG */}
        <View className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <View className="flex-row items-center gap-2 mb-2">
            <Calendar size={14} color="#ec4899" strokeWidth={2} />
            <Text className="text-[10px] font-bold text-pink-500 dark:text-pink-400 uppercase tracking-wider">
              Current AOG
            </Text>
          </View>
          {aog ? (
            <>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aog.weeks}
                </Text>
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Weeks
                </Text>
              </View>
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                + {aog.days} Days
              </Text>
            </>
          ) : (
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              LMP not set
            </Text>
          )}
        </View>

        {/* Est. Due Date */}
        <View className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <View className="flex-row items-center gap-2 mb-2">
            <CalendarDays size={14} color="#3b82f6" strokeWidth={2} />
            <Text className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
              Est. Due Date
            </Text>
          </View>
          {dueDate ? (
            <>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {dueDate.replace(/,\s*\d{4}$/, "")}
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Year {dueYear}
              </Text>
            </>
          ) : (
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              Not set
            </Text>
          )}
        </View>
      </View>

      {/* Assigned OB-GYN */}
      <View className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 mb-5 flex-row items-center gap-4 relative z-10">
        <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center">
          <Stethoscope size={20} color="#6366f1" strokeWidth={1.5} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            Assigned OB-GYN
          </Text>
          <Text className="text-sm font-bold text-gray-900 dark:text-white">
            {assignedDoctor?.fullName ?? "Not assigned"}
          </Text>
        </View>
      </View>

      {/* View Full Records Button */}
      <ButtonPressable
        onPress={onViewRecords}
        className="w-full py-3.5 bg-pink-500 dark:bg-pink-600 rounded-xl flex-row items-center justify-center gap-2 relative z-10"
      >
        <Text className="text-white font-semibold">View Full Records</Text>
        <ChevronRight size={16} color="white" strokeWidth={2} />
      </ButtonPressable>
    </View>
  );
}
