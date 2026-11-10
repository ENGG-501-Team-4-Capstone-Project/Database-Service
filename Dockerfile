FROM node:24-slim

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

RUN npm install -g "$(node -p "require('./package.json').packageManager || 'pnpm@11'")"

RUN pnpm install --frozen-lockfile

COPY . .

RUN DATABASE_URL=postgresql://build:build@localhost:5432/build pnpm prisma generate

RUN pnpm build

RUN chmod +x entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3001

CMD ["./entrypoint.sh"]
