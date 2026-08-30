#!/bin/sh
set -e

cd /app

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing npm dependencies..."
  npm ci
fi

exec npm run start -- --host 0.0.0.0 --poll 2000
