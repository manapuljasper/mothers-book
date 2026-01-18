import { View, Text, Pressable } from "react-native";
import { FlaskConical, ChevronRight, Upload } from "lucide-react-native";
import type { LabRequestWithDoctor } from "@/types";

interface PendingLabBannerProps {
  pendingLabs: LabRequestWithDoctor[];
  onUploadSingle: (lab: LabRequestWithDoctor) => void;
  onViewAll: () => void;
}

export function PendingLabBanner({
  pendingLabs,
  onUploadSingle,
  onViewAll,
}: PendingLabBannerProps) {
  if (pendingLabs.length === 0) return null;

  const isSingleLab = pendingLabs.length === 1;
  const firstLab = pendingLabs[0];

  return (
    <View className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
      <View className="flex-row items-start">
        <View className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-lg mr-3">
          <FlaskConical size={20} color="#d97706" strokeWidth={1.5} />
        </View>
        <View className="flex-1">
          <Text className="text-amber-900 dark:text-amber-100 font-semibold text-base">
            {isSingleLab ? "Lab Request Pending" : `${pendingLabs.length} Lab Requests Pending`}
          </Text>
          <Text className="text-amber-700 dark:text-amber-300 text-sm mt-0.5">
            {isSingleLab
              ? `${firstLab.description}${firstLab.doctorName ? ` • Requested by Dr. ${firstLab.doctorName.split(" ").pop()}` : ""}`
              : "Upload your results"}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => (isSingleLab ? onUploadSingle(firstLab) : onViewAll())}
        className="flex-row items-center justify-center bg-amber-600 dark:bg-amber-700 mt-3 py-2.5 px-4 rounded-lg"
      >
        {isSingleLab ? (
          <>
            <Upload size={16} color="white" strokeWidth={2} />
            <Text className="text-white font-semibold ml-2">Upload Results</Text>
          </>
        ) : (
          <>
            <Text className="text-white font-semibold">View All</Text>
            <ChevronRight size={16} color="white" strokeWidth={2} className="ml-1" />
          </>
        )}
      </Pressable>
    </View>
  );
}
