set -e

echo "Running Prisma migrations..."
pnpm prisma migrate deploy

echo "Generating Prisma Client..."
pnpm prisma generate

echo "Starting the application..."
exec "$@"
