import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../services/storage.service';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  // State
  mode: ThemeMode;

  // Computed - the actual color scheme to use
  colorScheme: 'light' | 'dark';

  // Actions
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const getSystemColorScheme = (): 'light' | 'dark' => {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
};

const resolveColorScheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemColorScheme();
  }
  return mode;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      colorScheme: resolveColorScheme('system'),

      setMode: (mode: ThemeMode) => {
        set({
          mode,
          colorScheme: resolveColorScheme(mode),
        });
      },

      toggleTheme: () => {
        const currentScheme = get().colorScheme;
        const newMode = currentScheme === 'light' ? 'dark' : 'light';
        set({
          mode: newMode,
          colorScheme: newMode,
        });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        // Re-resolve color scheme after rehydration
        if (state) {
          state.colorScheme = resolveColorScheme(state.mode);
        }
      },
    }
  )
);

// Selector for checking dark mode
export const selectIsDarkMode = (state: ThemeState) => state.colorScheme === 'dark';
