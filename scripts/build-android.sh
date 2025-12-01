#!/bin/bash
# Build for Android (requires Android SDK)

set -e

cd "$(dirname "$0")/.."

# Generate build info
node scripts/generate-build-info.js

echo "Building for Android..."
npx expo run:android
