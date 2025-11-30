#!/bin/bash
# Start Expo with tunnel mode - works through firewalls and NAT
# Useful when your phone and computer are on different networks

set -e

cd "$(dirname "$0")/.."

echo "Starting Expo with tunnel mode..."
echo "This may take a moment to establish the tunnel"
echo ""

npx expo start --tunnel
