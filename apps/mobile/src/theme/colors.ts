/**
 * Theme Color Tokens
 *
 * Centralized color system for light/dark mode with a professional,
 * clinical aesthetic. Uses slate-based neutrals with blue accent.
 */

import { useThemeStore } from '../stores/theme.store';

export const themeColors = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc', // slate-50
    surface2: '#f1f5f9', // slate-100
    border: '#e2e8f0', // slate-200
    borderSubtle: '#f1f5f9', // slate-100
    text: '#0f172a', // slate-900
    textMuted: '#64748b', // slate-500
    textSubtle: '#94a3b8', // slate-400
    accent: '#3b82f6', // blue-500
    accentLight: 'rgba(59, 130, 246, 0.1)',
    danger: '#ef4444', // red-500
    dangerLight: 'rgba(239, 68, 68, 0.1)',
    success: '#22c55e', // green-500
    successLight: 'rgba(34, 197, 94, 0.1)',
    successMuted: '#16a34a', // green-600
    dangerMuted: '#dc2626', // red-600
  },
  dark: {
    background: '#0f172a', // slate-900
    surface: '#1e293b', // slate-800
    surface2: '#334155', // slate-700
    border: '#334155', // slate-700
    borderSubtle: '#1e293b', // slate-800
    text: '#f8fafc', // slate-50
    textMuted: '#94a3b8', // slate-400
    textSubtle: '#64748b', // slate-500
    accent: '#60a5fa', // blue-400
    accentLight: 'rgba(96, 165, 250, 0.15)',
    danger: '#f87171', // red-400
    dangerLight: 'rgba(248, 113, 113, 0.15)',
    success: '#4ade80', // green-400
    successLight: 'rgba(74, 222, 128, 0.15)',
    successMuted: '#86efac', // green-300
    dangerMuted: '#fca5a5', // red-300
  },
} as const;

export type ThemeColors = typeof themeColors.light;

/**
 * Hook to get current theme colors based on color scheme
 */
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useThemeStore();
  return themeColors[colorScheme];
}
