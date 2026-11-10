#!/bin/sh
set -e

echo "Running Prisma migrations..."
pnpm prisma migrate deploy

echo "Generating Prisma client..."
pnpm prisma generate

echo "Starting server..."
exec pnpm run start
