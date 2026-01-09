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

## Architecture

This app uses **Expo Router** for file-based navigation. Routes are defined by the file structure in the `app/` directory.

### Route Structure

```
app/
├── _layout.tsx    # Root layout (wraps all routes)
├── index.tsx      # Home screen (/)
├── about.tsx      # About screen (/about)
└── [id].tsx       # Dynamic route (/:id)
```

### Key Files

- `app/_layout.tsx` - Root layout with navigation container and global CSS import
- `app/index.tsx` - Home screen component
- `global.css` - Tailwind directives (imported in _layout.tsx)

### Navigation Pattern

Use Expo Router's `Link` component or `useRouter` hook:
```tsx
import { Link, useRouter } from "expo-router";

// Declarative navigation
<Link href="/about">Go to About</Link>

// Programmatic navigation
const router = useRouter();
router.push("/about");
```

### NativeWind Setup

Styling uses NativeWind v4 with `className` props instead of StyleSheet:
- `global.css` - Tailwind directives (imported in _layout.tsx)
- `tailwind.config.js` - Tailwind config with NativeWind preset
- `metro.config.js` - Metro bundler wrapped with `withNativeWind`
- `babel.config.js` - Babel preset with `nativewind/babel`
- `nativewind-env.d.ts` - TypeScript types for className prop

### Styling Pattern

Use Tailwind classes via className prop:
```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-lg font-bold">Hello</Text>
</View>
```
