# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn start          # Start Expo dev server (press i for iOS, a for Android, w for web)
yarn ios            # Start on iOS simulator
yarn android        # Start on Android emulator
yarn web            # Start in web browser
```

## Tech Stack

- **React Native** with **Expo SDK 54** (New Architecture enabled)
- **Expo Router** for file-based navigation
- **TypeScript** with strict mode
- **NativeWind v4** for styling (Tailwind CSS for React Native)
- **TanStack React Query** for data fetching (queries & mutations)
- **Zustand** for auth state management
- **MMKV** for local storage (fast key-value store)

## Architecture

This is a **Digital Mother's Book** app - a healthcare application for maternal health records in the Philippines.

### Phase 1 Status
Currently using **sample data only** (no server connections). Data persists locally via MMKV.

### Route Structure

```
app/
├── _layout.tsx           # Root layout (initializes data)
├── index.tsx             # Entry redirect based on auth
├── (auth)/               # Authentication screens
│   ├── login.tsx
│   └── role-select.tsx
├── (doctor)/             # Doctor role screens
│   └── (tabs)/
│       ├── index.tsx     # Dashboard
│       ├── patients.tsx  # Patient list (booklet-level)
│       ├── scan.tsx      # QR scanner
│       └── profile.tsx
└── (mother)/             # Mother role screens
    └── (tabs)/
        ├── index.tsx     # Home / Booklets
        ├── medications.tsx
        ├── doctors.tsx   # Doctor directory
        └── profile.tsx
```

### Source Directory

```
src/
├── types/           # TypeScript type definitions
├── data/            # Sample data files
├── stores/          # Zustand stores (auth, booklet, medical, medication)
├── services/        # Storage service (MMKV)
├── hooks/           # Custom hooks
├── utils/           # Utilities (date, id generation, constants)
└── components/      # Reusable components
```

### Key Files

- `src/types/index.ts` - All TypeScript types
- `src/stores/auth.store.ts` - Authentication state
- `src/stores/booklet.store.ts` - Booklet management
- `src/data/index.ts` - Sample data initialization

### Data Model (Key Entities)

- **User** - Authentication account (doctor or mother role)
- **DoctorProfile** - Doctor information with PRC number
- **MotherProfile** - Mother information
- **MotherBooklet** - Pregnancy/child record (mothers can have multiple)
- **BookletAccess** - Doctor access to specific booklets (QR-based)
- **MedicalEntry** - Doctor-created medical records
- **Medication** - Prescribed medications with intake tracking
- **LabRequest** - Lab test requests and results

### Navigation Pattern

Role-based routing using Expo Router groups:
- `(auth)` - Login screens (unauthenticated)
- `(doctor)` - Doctor-only screens
- `(mother)` - Mother-only screens

```tsx
import { useRouter, Redirect } from "expo-router";
import { useAuthStore } from "../src/stores";

// Redirect based on role
if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
if (currentRole === "doctor") return <Redirect href="/(doctor)/(tabs)" />;
```

### State Management (Zustand)

Zustand is used primarily for **auth state** (current user, role, login/logout):

```tsx
import { useAuthStore } from "../src/stores";

const { currentUser, login, logout, doctorProfile, motherProfile } = useAuthStore();
```

### Data Fetching (React Query)

All data fetching should use **TanStack React Query** hooks from `src/hooks`:

```tsx
import {
  useBookletsByDoctor,
  useEntriesByBooklet,
  useMedicationsByBooklet,
  usePendingLabs,
  useCreateEntry,
  useCreateMedication,
} from "../src/hooks";

// Queries - automatically cache and refetch
const { data: booklets = [], isLoading } = useBookletsByDoctor(doctorId);
const { data: entries = [] } = useEntriesByBooklet(bookletId);

// Mutations - for creating/updating data
const createEntryMutation = useCreateEntry();

// Using mutations with async/await
const handleSave = async () => {
  try {
    const newEntry = await createEntryMutation.mutateAsync({
      bookletId,
      doctorId,
      entryType: "prenatal_checkup",
      visitDate: new Date(),
      notes: "...",
    });
    // React Query automatically invalidates related queries
  } catch (error) {
    Alert.alert("Error", "Failed to save");
  }
};
```

### API Layer Structure

Mock APIs in `src/api/` simulate backend calls with delay:

```
src/api/
├── client.ts           # Mock delay utilities
├── booklets.api.ts     # Booklet CRUD operations
├── medical.api.ts      # Entries & lab requests
├── medications.api.ts  # Medication management
└── index.ts            # Re-exports

src/hooks/
├── booklet/            # Booklet query & mutation hooks
│   └── index.ts
├── medical/            # Medical entries & lab request hooks
│   └── index.ts
├── medication/         # Medication query & mutation hooks
│   └── index.ts
└── index.ts            # Re-exports all hooks
```

When transitioning to a real backend, only the API implementations need to change - the hooks and components remain the same.

### NativeWind Setup

Styling uses NativeWind v4 with `className` props:
```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-lg font-bold text-pink-600">Hello</Text>
</View>
```

### Sample Data

Quick login available via email or quick-login buttons:
- **Doctors**: dr.santos@clinic.ph, dr.reyes@hospital.ph
- **Mothers**: maria.cruz@gmail.com, anna.garcia@gmail.com

Reset to default sample data: Profile → Reset Sample Data

## UI & Animation Conventions

### Dark Mode Support
The app supports dark mode via NativeWind's `dark:` variant system. The theme is controlled by a Zustand store (`useThemeStore`) that persists the user's preference.

**Theme Store Usage:**
```tsx
import { useThemeStore } from "../src/stores";

const { colorScheme, toggleTheme, setMode } = useThemeStore();
const isDark = colorScheme === "dark";
```

**Styling Pattern:**
- Use `dark:` prefixed classes for dark mode variants
- Common mappings:
  - `bg-white` → `bg-white dark:bg-gray-800`
  - `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
  - `text-gray-900` → `text-gray-900 dark:text-white`
  - `text-gray-500` → `text-gray-500 dark:text-gray-400`
  - `border-gray-100` → `border-gray-100 dark:border-gray-700`

**For JavaScript style objects (like tab bar styles):**
```tsx
const isDark = colorScheme === "dark";
tabBarStyle: {
  backgroundColor: isDark ? "#111827" : "#ffffff",
  borderTopColor: isDark ? "#374151" : "#e5e7eb",
}
```

**Toggle in Profile screens:**
Both doctor and mother profile screens include a Dark Mode toggle switch.

### Safe Area Handling for Colored Backgrounds
When a screen has a colored header/background that should extend to the screen edges (behind the status bar), do NOT use `SafeAreaView` with `edges={["top"]}`. This creates a white gap at the top.

Instead, use this pattern:
1. Set `SafeAreaView` to `edges={[]}` (or just `["bottom"]` if needed)
2. Set the `SafeAreaView` background to match the header color
3. Apply `useSafeAreaInsets()` and add `paddingTop: insets.top` to the colored header content

```tsx
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header extends to screen edge, content has safe padding */}
        <View className="bg-blue-500 px-6 py-6" style={{ paddingTop: insets.top }}>
          <Text className="text-white">Header Content</Text>
        </View>
        {/* Rest of screen content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

This ensures the colored background fills the entire top of the screen while keeping content below the status bar.

### Interactive Elements
All new clickable/tappable elements should use the appropriate animated pressable component from `src/components/ui`:
- `CardPressable` - For cards and larger tappable areas (scale: 0.98)
- `ListItemPressable` - For list items (scale: 0.99, subtle)
- `ButtonPressable` - For buttons (scale: 0.95, more pronounced)

```tsx
import { CardPressable, ListItemPressable } from "../src/components/ui";

<CardPressable onPress={() => navigate()}>
  <Text>Tappable card content</Text>
</CardPressable>
```

### Collapsible/Expandable Content
When implementing collapsible sections, use animated height transitions:
- Use `react-native-reanimated` for smooth expand/collapse
- Animate from height 0 to auto (or measured height)
- Use `withTiming` with ~200-300ms duration
- Include a visual indicator (+/−) showing state

### Animation Guidelines
- **Keep animations subtle** - avoid bouncy/spring animations
- **Use `withTiming`** instead of `withSpring` for direct, non-bouncy motion
- **Duration**: 100ms for press feedback, 200-300ms for layout changes
- **No staggered list animations** - items should appear immediately
- **Haptic feedback** only for meaningful actions (toggles, confirmations), not navigation

## Development Notes

- All dates are stored as Date objects (MMKV serializes/deserializes them)
- Booklet access is QR-based: Mother generates QR → Doctor scans → Access granted
- Medications track daily intake with adherence percentage
- Filipino context: PRC numbers, Philippine addresses, local medical terminology
