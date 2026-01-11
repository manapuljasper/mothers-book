# Mother's Book

A digital maternal health records application for the Philippines, built with React Native and Expo.

> **Note:** This app uses native modules (MMKV) and cannot run in Expo Go. You must use a development build or run locally via `expo run:ios` / `expo run:android`.

## Tech Stack

- **React Native** with **Expo SDK 54** (New Architecture enabled)
- **TypeScript** with strict mode
- **Expo Router** for file-based navigation
- **NativeWind v4** (Tailwind CSS for React Native)
- **TanStack React Query** for data fetching
- **Zustand** for state management
- **MMKV** for local storage

## Prerequisites

- Node.js 18+
- Yarn
- For iOS: macOS with Xcode installed
- For Android: Android Studio with SDK configured
- EAS CLI (optional, for cloud builds): `npm install -g eas-cli`

## Installation

```bash
git clone https://github.com/manapuljasper/mothers-book.git
cd mothers-book
yarn install
```

## Running the App

### On Simulators/Emulators

```bash
yarn ios      # iOS Simulator (requires Xcode)
yarn android  # Android Emulator (requires Android Studio)
```

### On Physical Devices

#### Option 1: Local Build (Recommended for Development)

**iOS** (requires Mac with Xcode):
```bash
# Connect your iPhone via USB
npx expo run:ios --device
```
This uses your free Apple ID for signing. Builds expire after 7 days but work for development.

**Android**:
```bash
# Connect your Android device via USB with USB debugging enabled
npx expo run:android --device
```

#### Option 2: EAS Build (Cloud)

First, configure EAS:
```bash
eas build:configure
```

**Android** (no account needed):
```bash
eas build -p android --profile development
```
Download the APK from the build page and install via QR code or `adb install`.

**iOS** (requires $99/year Apple Developer account):
```bash
eas build -p ios --profile development
```
EAS handles device registration and provisioning automatically.

### Development Server

After installing a development build on your device:
```bash
npx expo start --dev-client
```

## Project Structure

```
app/                    # Expo Router screens
├── (auth)/            # Login/signup screens
├── (doctor)/          # Doctor role screens
└── (mother)/          # Mother role screens

src/
├── api/               # API layer (mock/Supabase)
├── components/        # Reusable UI components
├── hooks/             # React Query hooks
├── stores/            # Zustand stores
├── types/             # TypeScript definitions
└── utils/             # Utilities
```

## Sample Data

Quick login credentials for testing:

**Doctors:**
- dr.santos@clinic.ph
- dr.reyes@hospital.ph

**Mothers:**
- maria.cruz@gmail.com
- anna.garcia@gmail.com

Reset sample data: Profile > Reset Sample Data

## Scripts

```bash
yarn start      # Start Expo dev server
yarn ios        # Run on iOS Simulator
yarn android    # Run on Android Emulator
yarn web        # Run in web browser
```

## License

MIT
