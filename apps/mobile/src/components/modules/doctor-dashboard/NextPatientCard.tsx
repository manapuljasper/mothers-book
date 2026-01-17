import { View, Text, TouchableOpacity } from "react-native";
import { QrCode, MoreHorizontal, BookOpen } from "lucide-react-native";
import { ButtonPressable } from "@/components/ui";

interface NextPatientCardProps {
  patientName: string;
  bookletLabel: string;
  queueNumber: string;
  onScanQR: () => void;
  onMoreOptions?: () => void;
}

export function NextPatientCard({
  patientName,
  bookletLabel,
  queueNumber,
  onScanQR,
  onMoreOptions,
}: NextPatientCardProps) {
  return (
    <View className="relative overflow-hidden rounded-2xl bg-doctor-500">
      {/* Decorative blur circles */}
      <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <View className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-black/10 blur-2xl" />

      {/* Content */}
      <View className="relative p-6 flex-col gap-6">
        {/* Top section - Patient info and queue */}
        <View className="flex-row items-start justify-between">
          {/* Patient info */}
          <View className="flex-col gap-1 flex-1">
            <Text className="text-2xl font-bold text-white">
              {patientName}
            </Text>
            <View className="flex-row items-center gap-2 opacity-90">
              <BookOpen size={18} color="white" strokeWidth={2} />
              <Text className="text-sm font-medium text-white">
                {bookletLabel}
              </Text>
            </View>
          </View>

          {/* Queue badge */}
          <View className="flex-col items-end">
            <View className="rounded-lg bg-white/20 px-3 py-1.5 border border-white/10">
              <View className="flex-row items-center">
                <Text className="text-xs font-medium text-white/80 uppercase mr-1">
                  Queue
                </Text>
                <Text className="text-lg font-bold text-white leading-none">
                  {queueNumber}
                </Text>
              </View>
            </View>
            <Text className="text-[10px] font-medium text-white/70 mt-1 uppercase tracking-wide">
              Serving Now
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row items-center gap-3 mt-2">
          {/* Scan QR Button */}
          <ButtonPressable
            onPress={onScanQR}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5"
          >
            <QrCode size={20} color="#2b7cee" strokeWidth={2} />
            <Text className="text-sm font-bold text-doctor-500">
              Scan QR
            </Text>
          </ButtonPressable>

          {/* More options button */}
          {onMoreOptions && (
            <TouchableOpacity
              onPress={onMoreOptions}
              activeOpacity={0.7}
              className="flex items-center justify-center rounded-xl bg-white/10 p-3.5"
            >
              <MoreHorizontal size={20} color="white" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
