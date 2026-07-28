#!/bin/sh
set -e

# Export env vars so they're available to child processes
export VITE_API_URL=${VITE_API_URL:-http://backend:4000}

echo "Starting frontend with VITE_API_URL=$VITE_API_URL"

# Run the dev server
npm run dev -- --host 0.0.0.0
