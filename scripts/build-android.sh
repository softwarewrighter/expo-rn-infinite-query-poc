#!/bin/bash
# Build for Android (requires Android SDK)

set -e

cd "$(dirname "$0")/.."

echo "Building for Android..."
npx expo run:android
