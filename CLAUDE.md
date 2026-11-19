# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npx expo start

# Platform-specific
npx expo start --ios
npx expo start --android
npx expo start --web

# Check for dependency issues
npx expo-doctor

# Fix dependency version mismatches
npx expo install --check

# Quality checks (run all three before committing; CI runs them too)
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint .
pnpm test        # jest (jest-expo); tests live in __tests__/ next to the code

# Run a single test file / a single test by name
pnpm test src/lib/__tests__/error-handler.test.ts
pnpm test -t "name of the test"

# Native dev builds (the app uses native modules like MMKV/Nitro, so Expo Go won't work)
pnpm dev-client          # start Metro for a dev client
pnpm ios / pnpm android  # expo run:* on a physical device

# EAS builds (profiles in eas.json) and skeleton generation
pnpm build:android:development | build:android:preview | build:android:production | build:ios:preview | build:ios:production
pnpm bones:generate      # boneyard-js skeleton loaders -> src/bones (generated on demand; src/bones does not exist yet)
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck, lint and test with pnpm 10 / Node 22. Use `pnpm` (lockfile is `pnpm-lock.yaml`).

## Architecture

**ToMo** (fuel-consumption tracker for scooters and motorbikes) is a React Native mobile app built with Expo + TypeScript. Entry point is [index.ts](index.ts) → [App.tsx](App.tsx).

### Provider Stack (App.tsx)

Providers are ordered by dependency — each layer depends on those below it:

```
GestureHandlerRootView → SafeAreaProvider → ThemeProvider
→ CacheProvider → KeyboardProvider → ToastProvider → ErrorProvider
→ BottomSheetProvider → RootNavigator
```

### Navigation

[src/navigation/root-navigator.tsx](src/navigation/root-navigator.tsx) is a native stack whose screens depend on the store's `onboardingDone`: while false only the **first-launch flow** exists (`Onboarding`: language → bike → welcome, ends by creating the bike and opening `FuelForm` through `navigateWhenReady` from [navigation-ref.ts](src/navigation/navigation-ref.ts)); afterwards: `Tabs` ([tab-navigator.tsx](src/navigation/tab-navigator.tsx): Home, History, Stats, Settings, with the custom floating `TabBar` whose centre "+" opens the fill-up form) and the modals `FuelForm` (add/edit a fill-up, `entryId` param = edit), `VehicleForm` (add/edit a vehicle) and `SettingEdit` (currency or alert threshold). No authentication, no backend: the app is 100 % offline.

### Key Providers

- **[cache-provider.tsx](src/providers/cache-provider.tsx)** — Generic TTL cache in MMKV with specialized hooks for preferences, searches, and location
- **[toast-provider.tsx](src/providers/toast-provider.tsx)** — Theme-aware toast notifications
- **[sheet-provider.tsx](src/providers/sheet-provider.tsx)** — Bottom sheet open/close state

### Styling

Uses **Uniwind** (Tailwind CSS v4 for React Native) via [global.css](global.css). The app is **dark only** (palette "Nuit & Néon": night `#0F1012`, surfaces `#17191C` / `#212428`, neon `#C5F25A`, coral `#FF6B5E`, amber `#F2B84B`). Tokens are CSS variables written in **hex** and mirrored exactly in [src/constants/color.ts](src/constants/color.ts) for JS-side consumers (SVG, navigation, icons): change colors in both files. `ThemeProvider` forces the dark theme. Neon is only for the main action, the key figure and a positive trend; coral only for overconsumption alerts and deletion; text contrast >= 4.5:1, touch targets >= 48 px. Fonts: Inter (texts) and Space Grotesk (figures, `numeric` prop of `ThemedText`), one font family per weight (`font-sans-medium`, `font-display-semibold`…). Radii: `rounded-chip` 6, `rounded-card` 22, `rounded-hero` 28. Use `cn()` from [src/utils/tailwind.ts](src/utils/tailwind.ts) to merge classes. Themed primitives live in [src/components/ui/](src/components/ui/).

### Storage

All persistence uses **MMKV** (not AsyncStorage). Single general-purpose cache instance.

### Fuel tracking domain

A vehicle is **brand + model + year (required) and engine size, tank capacity, photo (optional)**; `vehicleName()` gives "Yamaha Cygnus X". None is created by default: the first-launch flow creates the first one (`completeOnboarding`). Several vehicles are supported: every fill-up has a `vehicleId`, the store keeps `vehicles[]` + `activeVehicleId`, and screens read the active vehicle through `useActiveVehicle()` (null if none) / `useVehicleEntries()` / `useConsumption()`; `useOpenFuelForm()` redirects to the vehicle form when there is no vehicle. Photos are files in the document directory ([src/lib/vehicle-photo.ts](src/lib/vehicle-photo.ts)), not included in backups. Currency and alert threshold are app-wide `settings`; tank capacity is per vehicle. Everything lives in a zustand store persisted to MMKV ([src/features/fuel/store.ts](src/features/fuel/store.ts)), **versioned (v4)**: any schema change needs a migration in [src/lib/migrations.ts](src/lib/migrations.ts), and backups ([src/lib/data-io.ts](src/lib/data-io.ts), format v3) must stay importable from older versions. **Derived values (consumption, averages) are never stored**: they come from the pure "full-to-full" module [src/lib/consumption.ts](src/lib/consumption.ts) (`computeConsumption`, recomputed by `useConsumption()`). Never average per-segment averages: the global average is total liters × 100 / total km. Round only at display time via [src/lib/format.ts](src/lib/format.ts) (French formats, comma/point input via `parseDecimal`). Form rules live in [src/lib/validation.ts](src/lib/validation.ts) (fill-up and vehicle; returns codes, UI translates). Charts are hand-drawn with react-native-svg.

### i18n

`i18next` + `react-i18next` ([src/i18n/i18n.ts](src/i18n/i18n.ts)): **French (`fr`, default) and Malagasy (`mg`)** under `src/i18n/locales/<lng>/{common,errors,fuel}.json`. The language is chosen at first launch (nothing preselected) and changeable in Settings; it is persisted in the MMKV cache (`CACHE_KEYS.LANGUAGE`) by a custom language detector, so i18n depends on `cache-provider`'s `cacheStorage`. Every key must exist in both languages with the same `{{variables}}` (enforced by `src/i18n/__tests__/locales.test.ts`). Tone: informal "tu", short sentences, figures first. Malagasy texts need review by a native speaker. Types come from `Locales.fr`.

### Error handling

[src/lib/error-handler.ts](src/lib/error-handler.ts) holds pure functions (`classifyError`, stack-trace parsing for Hermes/JSC; stack details only in dev). UI code should report errors through `ErrorProvider` (`showError`) rather than calling the classifier directly; user-facing messages come from the `errors` i18n namespace.

### Environment

Read env vars only through [src/lib/env.ts](src/lib/env.ts) (`ENV`), never `process.env` directly. Only `EXPO_PUBLIC_*` vars are available client-side; copy `.env.example` to `.env.local`. `app.config.ts` (dynamic) is used alongside `app.json`; build profiles are in `eas.json`.

### Path Alias

`@/*` resolves to the project root (configured in [tsconfig.json](tsconfig.json)).

## Feature Structure

New features go in [src/features/](src/features/) as screen-level modules. Shared UI primitives belong in [src/components/ui/](src/components/ui/); layout wrappers in [src/components/layout/](src/components/layout/).

## Code conventions (mandatory)

- **Shared components first**: build screens with the components in [src/components/ui/](src/components/ui/) and [src/components/layout/](src/components/layout/) (`ThemedView`/`Row`, `ThemedText`, `ThemedButton`, `ThemedInput`, `ThemedIcon`, `Screen`, `ScrollContainer`…), not raw React Native primitives. If nothing fits, create or extend a shared component there; generic pieces never live inside a feature folder.
- **Tailwind only**: style through `className` + `cn()`. Inline `style` is allowed only for values that can't be expressed in Tailwind (safe-area insets, computed sizes).
- **No hard-coded colors**: only theme tokens / Tailwind palette classes (`bg-primary`, `text-foreground`…). JS-side colors (SVG, icons, navigation) come from `useThemeColor`, never from literals.
- Follow the existing architecture (features/ for screens, providers/, theme/, i18n namespaces).
- **Lists**: use `ThemedList` ([src/components/ui/themed-list.tsx](src/components/ui/themed-list.tsx)), a Uniwind-wrapped **FlashList v2** (no `estimatedItemSize`; FlashList has no sections, so flatten grouped data into typed rows + `getItemType`). Never use FlatList/SectionList/ScrollView-with-map for long lists.
- Handy shared pieces: `ThemedPressable` (44 px targets via `min-h-11 min-w-11`), `ScreenHeader` (round back button + title for stacked screens), `Screen` (`safeAreaEdges={['top']}` for tab screens), `ScrollContainer`, `RowGroup` + `ListRow` + `SwitchRow` (settings-style cards), `SegmentedControl`, `StatCard`, `Odometer`, `AnimatedNumber`, `MiniBars`, `Status`, `BarChart`, `TabBar`, and `ThemedIcon` (add new icons to its `iconMap` instead of importing lucide in screens).
