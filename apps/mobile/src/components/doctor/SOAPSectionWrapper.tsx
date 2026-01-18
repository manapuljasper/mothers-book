/**
 * SOAP Section Wrapper
 *
 * A container component that wraps SOAP form sections with a colored border
 * and subtle background tint matching the section's color theme.
 */

import { View } from "react-native";
import { SOAPSectionHeader, type SOAPSection } from "./SOAPSectionHeader";

interface SOAPSectionWrapperProps {
  section: SOAPSection;
  /** Optional custom subtitle for the header */
  subtitle?: string;
  children: React.ReactNode;
}

// Section colors for wrapper styling
const SECTION_COLORS: Record<
  SOAPSection,
  { border: string; bg: string }
> = {
  subjective: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
  },
  objective: {
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
  },
  assessment: {
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/5",
  },
  plan: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
  },
};

export function SOAPSectionWrapper({
  section,
  subtitle,
  children,
}: SOAPSectionWrapperProps) {
  const colors = SECTION_COLORS[section];

  return (
    <View
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-3`}
    >
      {/* Header already has mb-3 built-in */}
      <SOAPSectionHeader section={section} subtitle={subtitle} />

      {/* Section content */}
      {children}
    </View>
  );
}
