import { View, Text } from "react-native";

type QueueStatus = "checked_in" | "expected" | "done";

interface QueueStatusBadgeProps {
  status: QueueStatus;
}

const STATUS_STYLES: Record<
  QueueStatus,
  {
    bgColor: string;
    textColor: string;
    ringColor: string;
    label: string;
  }
> = {
  checked_in: {
    bgColor: "bg-green-500/10",
    textColor: "text-green-400",
    ringColor: "border-green-500/20",
    label: "Checked In",
  },
  expected: {
    bgColor: "bg-blue-400/10",
    textColor: "text-blue-400",
    ringColor: "border-blue-400/20",
    label: "Expected",
  },
  done: {
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-400",
    ringColor: "border-slate-500/20",
    label: "Done",
  },
};

export function QueueStatusBadge({ status }: QueueStatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <View
      className={`px-2 py-1 rounded-md ${style.bgColor} border ${style.ringColor}`}
    >
      <Text
        className={`text-[10px] font-bold uppercase tracking-wide ${style.textColor}`}
      >
        {style.label}
      </Text>
    </View>
  );
}
