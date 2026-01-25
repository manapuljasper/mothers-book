/**
 * Section Card
 *
 * A unified neutral card component for form sections.
 * Replaces the rainbow-colored SOAP sections with a clean,
 * professional clinical aesthetic.
 */

import { View, Text, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import {
  MessageSquare,
  Activity,
  ClipboardCheck,
  ListChecks,
} from 'lucide-react-native';
import { useThemeColors } from '../../theme';

export type SectionType = 'subjective' | 'objective' | 'assessment' | 'plan';

interface SectionCardProps {
  section: SectionType;
  /** Optional custom subtitle for the header */
  subtitle?: string;
  children: React.ReactNode;
}

// Section configuration with neutral styling
const SECTION_CONFIG: Record<
  SectionType,
  {
    title: string;
    subtitle: string;
    icon: LucideIcon;
  }
> = {
  subjective: {
    title: 'Subjective',
    subtitle: 'Chief Complaint & History',
    icon: MessageSquare,
  },
  objective: {
    title: 'Objective',
    subtitle: 'Vitals & Examination Findings',
    icon: Activity,
  },
  assessment: {
    title: 'Assessment',
    subtitle: 'Diagnosis & Risk Level',
    icon: ClipboardCheck,
  },
  plan: {
    title: 'Plan',
    subtitle: 'Recommendations & Follow-up',
    icon: ListChecks,
  },
};

export function SectionCard({
  section,
  subtitle,
  children,
}: SectionCardProps) {
  const colors = useThemeColors();
  const config = SECTION_CONFIG[section];
  const IconComponent = config.icon;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconComponent
          size={20}
          color={colors.textMuted}
          strokeWidth={1.5}
        />
        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            {config.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSubtle },
            ]}
          >
            {subtitle ?? config.subtitle}
          </Text>
        </View>
      </View>

      {/* Section content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
