# Prisma + PostgreSQL

Requires Node 24+ and pnpm 11 or newer. Review .env before starting.

Create the initial migration and example user:

```sh
docker compose up -d database
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

Run the API locally:

```sh
pnpm dev
```

Or run the full Docker stack:

```sh
docker compose up --build -d
```

GET /health checks the database.
GET /users returns the seeded example user.

Commit prisma/migrations. The API container applies committed migrations
before starting.

After schema changes:

```sh
pnpm prisma migrate dev --name your_change
docker compose up --build -d
```

For source watching:

```sh
docker compose up --build --watch
```

Prisma Studio:

```sh
pnpm prisma studio
```

The image retains development dependencies for Prisma CLI and tsx.

For special characters in credentials, URL-encode the username/password in
DATABASE_URL and replace the API's Compose DATABASE_URL with an encoded URL.

If src/server.ts already existed, register prismaPlugin and add routes manually.
