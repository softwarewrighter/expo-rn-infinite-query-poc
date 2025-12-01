# Expo RN POC: Infinite Scroll with TanStack Query

Shares the same API contract as the web app.

![App Screenshot](images/screenshot.png?ts=1764552868000)

*Screenshot showing the infinite scroll feed with animated Hero, Quote, and Card components. Each component animates into view as you scroll - images slide in from the left, quotes type out character-by-character, badges pop in with counting animations, and hero cards pulse with a cyan glow effect.*

## Prereqs
- Node >= 18
- Expo CLI (`npm i -g expo` or use `npx expo`)
- iOS Simulator / Android Emulator or Expo Go on a device

## Configure API base
By default, it points to `http://192.168.1.152:5174`. If using a **physical device**, change `API_BASE` in `app/App.js` to your machine's LAN IP (e.g., `http://192.168.1.50:5174`).

## Quick Start

```bash
# 1. Install dependencies
./scripts/install.sh

# 2. Start the mock API server (in a separate terminal)
node server.js

# 3. Start Expo dev server
./scripts/start.sh

# 4. Build and run on Android emulator
./scripts/build-android.sh
```

## Running the Mock Server

The app requires a backend API server. A mock server is included:

```bash
node server.js
```

This starts a server on port 5174 with the following endpoints:
- `GET /api/sections?page=0` - Get paginated list of sections
- `GET /api/section?kind=hero&index=0` - Get individual section details

## Scripts

| Script | Description |
|--------|-------------|
| `./scripts/install.sh` | Install dependencies |
| `./scripts/start.sh` | Start Expo dev server (default mode) |
| `./scripts/start-lan.sh` | Start in LAN mode (phone on same WiFi, faster) |
| `./scripts/start-tunnel.sh` | Start with tunnel (works across networks/firewalls) |
| `./scripts/build-ios.sh` | Build native iOS app (requires macOS + Xcode) |
| `./scripts/build-android.sh` | Build native Android app (requires Android SDK) |

## Testing on Your Phone

1. Install [Expo Go](https://expo.dev/client) on your phone
2. Run `node server.js` to start the mock API
3. Run `./scripts/start.sh` (or `start-lan.sh` for same WiFi network)
4. Scan the QR code with Expo Go

**Note:** Update `API_BASE` in `app/App.js` to your computer's LAN IP (e.g., `192.168.x.x:5174`) for the API to work on your phone.

## Run (Alternative)

```bash
npm i
node server.js &     # Start mock server in background
npx expo start
```

Then press `i` (iOS simulator) or `a` (Android emulator), or scan the QR code with Expo Go on your device.

## Features

- **Infinite Scroll**: `FlatList` + `onEndReached` for paging with `useInfiniteQuery`
- **Per-item Data Fetching**: Each row uses `useQuery(['section', kind, index])` to fetch content
- **Viewport Animations**: Components animate when they scroll into view using `react-native-reanimated`
  - Hero cards: Slide reveal images with pulsing cyan glow border
  - Quote cards: Typewriter text effect
  - Card items: Tilt animation on entry
  - Video cards: Auto-playing videos with pulsing red border
  - All items: Fade in, scale up, slide up animations
  - Animated badges with counting effect
- **Auto-playing Videos**: Video components using `expo-av` that:
  - Auto-play when scrolled into view
  - Auto-pause when scrolled out of view
  - Loop continuously
  - Display native video controls

## Component Types

| Type | Description |
|------|-------------|
| Hero | Large image with slide reveal animation, pulsing cyan glow |
| Card | Compact image + text with tilt animation |
| Quote | Italicized text with typewriter effect |
| Video | Auto-playing video with red glow border |

## Notes
- Uses `FlatList`'s `onViewableItemsChanged` to track which items are visible
- Animations trigger only once when items first become visible (except videos which play/pause based on visibility)
- To add offline cache persistence, wire `@tanstack/react-query-persist-client` with AsyncStorage.
