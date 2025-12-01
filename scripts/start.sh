#!/bin/bash
# Start Expo development server with QR code for mobile testing
# Scan the QR code with Expo Go app on your phone

set -e

cd "$(dirname "$0")/.."

# Generate build info
node scripts/generate-build-info.js

echo "Starting Expo development server..."
echo "Scan the QR code with Expo Go app on your phone"
echo ""

npx expo start
