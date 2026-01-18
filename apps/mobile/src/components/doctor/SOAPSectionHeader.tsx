/**
 * SOAP Section Header
 *
 * Visual section headers for the SOAP-format medical entry form.
 * Each section has a distinct color to aid quick visual scanning:
 * - S (Subjective): Coral/Rose - patient's reported symptoms
 * - O (Objective): Teal/Cyan - measured findings
 * - A (Assessment): Indigo/Purple - diagnosis and risk
 * - P (Plan): Emerald/Green - treatment plan
 */

import { View, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  MessageSquare,
  Activity,
  ClipboardCheck,
  ListChecks,
} from "lucide-react-native";

export type SOAPSection = "subjective" | "objective" | "assessment" | "plan";

interface SOAPSectionHeaderProps {
  section: SOAPSection;
  /** Optional subtitle for additional context */
  subtitle?: string;
}

// Section configuration with colors and icons
const SOAP_CONFIG: Record<
  SOAPSection,
  {
    letter: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    colors: {
      bg: string;
      border: string;
      letterBg: string;
      letterText: string;
      titleText: string;
      subtitleText: string;
      iconColor: string;
    };
  }
> = {
  subjective: {
    letter: "S",
    title: "Subjective",
    subtitle: "Chief Complaint & History",
    icon: MessageSquare,
    colors: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      border: "border-rose-200 dark:border-rose-800/50",
      letterBg: "bg-rose-500 dark:bg-rose-600",
      letterText: "text-white",
      titleText: "text-rose-900 dark:text-rose-200",
      subtitleText: "text-rose-600 dark:text-rose-400",
      iconColor: "#f43f5e",
    },
  },
  objective: {
    letter: "O",
    title: "Objective",
    subtitle: "Vitals & Examination Findings",
    icon: Activity,
    colors: {
      bg: "bg-teal-50 dark:bg-teal-950/30",
      border: "border-teal-200 dark:border-teal-800/50",
      letterBg: "bg-teal-500 dark:bg-teal-600",
      letterText: "text-white",
      titleText: "text-teal-900 dark:text-teal-200",
      subtitleText: "text-teal-600 dark:text-teal-400",
      iconColor: "#14b8a6",
    },
  },
  assessment: {
    letter: "A",
    title: "Assessment",
    subtitle: "Diagnosis & Risk Level",
    icon: ClipboardCheck,
    colors: {
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      border: "border-indigo-200 dark:border-indigo-800/50",
      letterBg: "bg-indigo-500 dark:bg-indigo-600",
      letterText: "text-white",
      titleText: "text-indigo-900 dark:text-indigo-200",
      subtitleText: "text-indigo-600 dark:text-indigo-400",
      iconColor: "#6366f1",
    },
  },
  plan: {
    letter: "P",
    title: "Plan",
    subtitle: "Recommendations & Follow-up",
    icon: ListChecks,
    colors: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800/50",
      letterBg: "bg-emerald-500 dark:bg-emerald-600",
      letterText: "text-white",
      titleText: "text-emerald-900 dark:text-emerald-200",
      subtitleText: "text-emerald-600 dark:text-emerald-400",
      iconColor: "#10b981",
    },
  },
};

export function SOAPSectionHeader({
  section,
  subtitle,
}: SOAPSectionHeaderProps) {
  const config = SOAP_CONFIG[section];
  const IconComponent = config.icon;

  return (
    <View
      className={`flex-row items-center rounded-xl px-4 py-3 mb-3 border ${config.colors.bg} ${config.colors.border}`}
    >
      {/* Letter Badge */}
      <View
        className={`w-10 h-10 rounded-xl ${config.colors.letterBg} items-center justify-center mr-3 shadow-sm`}
        style={{
          shadowColor: config.colors.iconColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <Text className={`text-xl font-black ${config.colors.letterText}`}>
          {config.letter}
        </Text>
      </View>

      {/* Title and Subtitle */}
      <View className="flex-1">
        <Text className={`text-base font-bold ${config.colors.titleText}`}>
          {config.title}
        </Text>
        <Text className={`text-xs ${config.colors.subtitleText}`}>
          {subtitle || config.subtitle}
        </Text>
      </View>

      {/* Icon */}
      <IconComponent
        size={20}
        color={config.colors.iconColor}
        strokeWidth={1.5}
      />
    </View>
  );
}

/**
 * Compact version for inline use in existing forms
 * Just shows the colored letter indicator
 */
interface SOAPLetterBadgeProps {
  section: SOAPSection;
  size?: "sm" | "md";
}

export function SOAPLetterBadge({
  section,
  size = "md",
}: SOAPLetterBadgeProps) {
  const config = SOAP_CONFIG[section];
  const dimensions = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const fontSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <View
      className={`${dimensions} rounded-lg ${config.colors.letterBg} items-center justify-center`}
    >
      <Text className={`${fontSize} font-black ${config.colors.letterText}`}>
        {config.letter}
      </Text>
    </View>
  );
}
