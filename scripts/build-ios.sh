#!/bin/bash
# Build for iOS (requires macOS and Xcode)

set -e

cd "$(dirname "$0")/.."

# Generate build info
node scripts/generate-build-info.js

echo "Building for iOS..."
npx expo run:ios
