#!/bin/bash
# Start Expo in LAN mode - phone must be on same WiFi network
# Faster than tunnel mode

set -e

cd "$(dirname "$0")/.."

echo "Starting Expo in LAN mode..."
echo "Make sure your phone is on the same WiFi network"
echo ""

npx expo start --lan
