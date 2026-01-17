# Mobile App (apps/mobile)

React Native/Expo app for the Digital Mother's Book.

## Tech Stack
- **Expo SDK 54** (New Architecture enabled)
- **Expo Router** - file-based navigation
- **NativeWind v4** - Tailwind for React Native
- **Convex** - backend (shared with web)
- **Zustand** - auth state
- **MMKV** - local storage

## Running the App

**Cannot use Expo Go** (requires native modules). Use:
```bash
yarn ios              # iOS simulator
yarn android          # Android emulator
npx expo run:ios      # Local build
```

## Route Structure

Role-based routing:
- `(auth)/` - Login screens
- `(doctor)/` - Doctor screens
- `(mother)/` - Mother screens

```tsx
if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
if (role === "doctor") return <Redirect href="/(doctor)/(tabs)" />;
```

## Styling (NativeWind)

```tsx
<View className="flex-1 bg-white dark:bg-gray-800">
  <Text className="text-gray-900 dark:text-white">Hello</Text>
</View>
```

### Dark Mode
```tsx
const { colorScheme } = useThemeStore();
const isDark = colorScheme === "dark";
```

Common mappings:
- `bg-white` → `bg-white dark:bg-gray-800`
- `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
- `text-gray-900` → `text-gray-900 dark:text-white`
- `border-gray-100` → `border-gray-100 dark:border-gray-700`

### Safe Area with Colored Headers

Don't use `edges={["top"]}` with colored backgrounds. Instead:
```tsx
const insets = useSafeAreaInsets();

<SafeAreaView className="flex-1 bg-blue-500" edges={[]}>
  <View style={{ paddingTop: insets.top }}>
    {/* Header content */}
  </View>
</SafeAreaView>
```

## Components

### Pressables (use for all tappable elements)
```tsx
import { CardPressable, ListItemPressable, ButtonPressable } from "../src/components/ui";
```

### Form Components
```tsx
import { Button, TextField, OptionButtonGroup, DatePickerButton } from "../src/components/ui";

<Button variant="primary" onPress={save}>Save</Button>
<Button variant="secondary|outline|ghost|danger" />

<TextField label="Email" value={v} onChangeText={setV} error={err} />

<OptionButtonGroup options={["mg","mL"]} value={v} onChange={setV} />
```

### Display Components
```tsx
import { StatusBadge, LoadingScreen, ModalHeader, PageHeader } from "../src/components/ui";

<StatusBadge status="active|pending|completed|ended" />
if (loading) return <LoadingScreen />;
```

### Domain Components
```tsx
import { MedicationCard, LabRequestCard, VitalsDisplay } from "../src/components";
```

## Hooks

All in `src/hooks/`:
```tsx
// Booklets
useBookletsByMother(motherId)
useBookletsByDoctor(doctorId)
useCreateBooklet()

// Medical
useEntriesByBooklet(bookletId)
useCreateEntry()
usePendingLabs(doctorId)

// Medications
useMedicationsByBooklet(bookletId)
useCreateMedication()
useLogIntake()
```

## Animation Guidelines

- Use `withTiming` (not `withSpring`) - no bouncy animations
- 100ms for press feedback, 200-300ms for layout changes
- No staggered list animations
- Haptics only for meaningful actions (toggles, confirmations)

## Component Reusability

Create reusable component when:
- Pattern appears 2+ times
- Has consistent structure
- Represents common UI concept

Place in:
- `src/components/ui/` - presentational components
- `src/components/` - components with business logic
