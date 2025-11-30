#!/bin/bash
# Build for iOS (requires macOS and Xcode)

set -e

cd "$(dirname "$0")/.."

echo "Building for iOS..."
npx expo run:ios
