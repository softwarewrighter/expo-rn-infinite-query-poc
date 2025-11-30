# Expo RN POC: Infinite Scroll with TanStack Query

Shares the same API contract as the web app.

## Prereqs
- Node ≥ 18
- Expo CLI (`npm i -g expo` or use `npx expo`)
- iOS Simulator / Android Emulator or Expo Go on a device

## Configure API base
By default, it points to `http://localhost:5174`. If using a **physical device**, change `API_BASE` in `app/App.js` to your machine's LAN IP (e.g., `http://192.168.1.50:5174`).

## Quick Start

```bash
# Install dependencies
./scripts/install.sh

# Start Expo dev server with QR code
./scripts/start.sh
```

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
2. Run `./scripts/start.sh` (or `start-lan.sh` for same WiFi network)
3. Scan the QR code with Expo Go

**Note:** Update `API_BASE` in `app/App.js:5` to your computer's LAN IP (e.g., `192.168.x.x:5174`) for the API to work on your phone.

## Run (Alternative)

```bash
npm i
npx expo start
```

Then press `i` (iOS simulator) or `a` (Android emulator), or scan the QR code with Expo Go on your device.

## Notes
- Uses `FlatList` + `onEndReached` for paging (`useInfiniteQuery`).
- Each row uses `useQuery(['section', kind, index])` to fetch content.
- To add offline cache persistence, wire `@tanstack/react-query-persist-client` with AsyncStorage.
