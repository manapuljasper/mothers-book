import { View, Text, Pressable } from "react-native";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Pencil,
  Trash2,
} from "lucide-react-native";
import { useThemeStore } from "../../stores";

interface ScheduleItem {
  days: string;
  startTime: string;
  endTime: string;
}

interface ClinicCardProps {
  name: string;
  address: string;
  contactNumber?: string;
  schedule?: ScheduleItem[];
  isPrimary?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetPrimary?: () => void;
  showActions?: boolean;
}

export function ClinicCard({
  name,
  address,
  contactNumber,
  schedule,
  isPrimary,
  onEdit,
  onDelete,
  onSetPrimary,
  showActions = true,
}: ClinicCardProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700/60 mb-3">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-bold text-gray-900 dark:text-white flex-1">
              {name}
            </Text>
            {isPrimary && (
              <View className="flex-row items-center bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full ml-2">
                <Star
                  size={12}
                  color="#f59e0b"
                  fill="#f59e0b"
                  strokeWidth={2}
                />
                <Text className="text-amber-700 dark:text-amber-400 text-xs font-medium ml-1">
                  Primary
                </Text>
              </View>
            )}
          </View>
        </View>

        {showActions && (
          <View className="flex-row items-center ml-2">
            {onEdit && (
              <Pressable
                onPress={onEdit}
                className="p-2 rounded-lg active:bg-gray-100 dark:active:bg-slate-700"
              >
                <Pencil size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                onPress={onDelete}
                className="p-2 rounded-lg active:bg-gray-100 dark:active:bg-slate-700"
              >
                <Trash2 size={16} color="#ef4444" />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Address */}
      <View className="flex-row items-start mb-2">
        <MapPin
          size={14}
          color={isDark ? "#9ca3af" : "#6b7280"}
          strokeWidth={2}
        />
        <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2 flex-1">
          {address}
        </Text>
      </View>

      {/* Contact Number */}
      {contactNumber && (
        <View className="flex-row items-center mb-2">
          <Phone
            size={14}
            color={isDark ? "#9ca3af" : "#6b7280"}
            strokeWidth={2}
          />
          <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {contactNumber}
          </Text>
        </View>
      )}

      {/* Schedule */}
      {schedule && schedule.length > 0 && (
        <View className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700/50">
          <View className="flex-row items-center mb-1.5">
            <Clock
              size={12}
              color={isDark ? "#9ca3af" : "#6b7280"}
              strokeWidth={2}
            />
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1.5">
              Schedule
            </Text>
          </View>
          {schedule.map((item, index) => (
            <View key={index} className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {item.days}
              </Text>
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {item.startTime} - {item.endTime}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Set as Primary Button */}
      {showActions && !isPrimary && onSetPrimary && (
        <Pressable
          onPress={onSetPrimary}
          className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/50"
        >
          <Text className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium">
            Set as Primary
          </Text>
        </Pressable>
      )}
    </View>
  );
}
