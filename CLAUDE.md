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
- **Zustand** for state management
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

```tsx
import { useAuthStore, useBookletStore } from "../src/stores";

// Auth
const { currentUser, login, logout } = useAuthStore();

// Booklets
const { getBookletsByMother, grantAccess } = useBookletStore();
```

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

## Development Notes

- All dates are stored as Date objects (MMKV serializes/deserializes them)
- Booklet access is QR-based: Mother generates QR → Doctor scans → Access granted
- Medications track daily intake with adherence percentage
- Filipino context: PRC numbers, Philippine addresses, local medical terminology
