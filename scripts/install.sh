#!/bin/bash
# Install dependencies

set -e

cd "$(dirname "$0")/.."

echo "Installing dependencies..."
npm install

echo ""
echo "Done! Run ./scripts/start.sh to start the dev server"
